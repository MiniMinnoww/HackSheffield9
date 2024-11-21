import key_centre
from constants import *



def get_related_note(note, semitones):
    """
    Finds the note that is a given number of semitones away from the input note.

    :param note: The starting note.
    :param semitones: The number of semitones to move up (positive) or down (negative).
    :return: The resulting note.
    """
    return NOTES[(NOTES.index(note) + semitones) % 12]

def complete_chords(notes_list, intervals):
    """
    Generates dictionaries of all possible major and minor chords for each note.
    In format: {'C': {'C': 'I', 'D', 'II'}, 'D' ...}

    :param notes_list: List of note names (e.g., ["C", "Db", ...]).
    :param intervals: Dictionary of all intervals.
    :return: Two dictionaries (major and minor chords) with notes mapped to intervals.
    """
    chord_dict = {}
    for chord_type in intervals:
        chord_dict[chord_type] = dict()

        # For every note
        for root in notes_list:
            # Make a dict entry for this note in both major and minor dict
            chord_dict[chord_type][root] = dict()

            # Calculate chords for the root note

            for note in intervals[chord_type]: # Go through each interval in a scale
                next_note = get_related_note(root, intervals[chord_type][note]) # Find note X semitones from the root
                chord_dict[chord_type][root][next_note] = note # Set the note X semitones from the root to the dict

    return chord_dict

def print_chords(chord_dict):
    """
    Converts a chord dictionary into a human-readable string.

    :param chord_dict: Dictionary of chords.
    :return: A formatted string representation of the chords.
    """
    output = ""
    for chord in chord_dict:
        output += chord + "\n"
        for note in chord_dict[chord]:
            output += note + ": " + chord_dict[chord][note] + "\n"
        output += "\n\n"
    return output

def check_all_chords(note, possible_chords, chord_dict):
    """
    Checks which chords (major and minor) a given note belongs to and updates their weightings.

    :param note: The note to check.
    :param possible_chords: Dictionary tracking potential chords and their weightings.
    :param chord_dict: Dictionary of all chords.
    :return: Updated possible_chords dictionary.
    """

    for chord_type in chord_dict:
        for chord in chord_dict[chord_type]:
            chord_id = chord + " " + chord_type

            if note in chord_dict[chord_type][chord]:
                weighting = INTERVAL_WEIGHTING[chord_dict[chord_type][chord][note]]
                if chord_id in possible_chords:
                    possible_chords[chord_id] += weighting
                else:
                    possible_chords[chord_id] = weighting

    return possible_chords

def check_notes_in_section(notes_list, chord_dict):
    """
    Identifies possible chords for a section based on the notes present.

    :param notes_list: List of notes in the section.
    :param chord_dict: Dictionary of all chords.
    :return: Dictionary of possible chords and their weightings.
    """
    possible_chords = dict()
    for note in notes_list:
        possible_chords = check_all_chords(note, possible_chords, chord_dict)
    return possible_chords

def notes_in_section(notes_dict, chord_dict):
    """
    Processes a section of notes and determines the most likely chord for each section.

    :param notes_dict: Dictionary of note occurrences in each section.
    :param chord_dict: Dictionary of all chords.
    :return: List of dictionaries representing detected chords, their type, root, and length.
    """
    data_to_return = []
    i = 0

    for chord_change in notes_dict:
        if i == 0:
            pass
        else:
            # Calculate the length of the previous chord section.
            current_index = notes_dict[chord_change]["start_index"]
            length = current_index - prev_start_index
            chord_used["length"] = length
            data_to_return.append(chord_used)

        # Gather notes in the current section.
        notes_list = []
        note_prevalences = notes_dict[chord_change]
        for note in note_prevalences:
            if note == "start_index":
                prev_start_index = notes_dict[chord_change]["start_index"]
            else:
                notes_list.append(note)

        # Determine the most likely chord for the current section.
        possible_chords = check_notes_in_section(notes_list, chord_dict)

        extra_weights = key_centre.get_weights_for_chords_in_key(notes_dict)
        for weight in extra_weights:
            for chord in possible_chords:
                if weight == chord:
                    possible_chords[chord] += extra_weights[weight]


        if len(notes_list) < 1:
            continue
        else:

            top_chord = most_likely_chord(possible_chords)

        # Determine chord type (major or minor).
        chord_used = {
            "root": int(NOTES.index(top_chord.split(" ")[0])),
            "type": top_chord.split(" ")[1]
        }

        i += 1

    # Handle the last section.
    current_index = notes_dict[chord_change]["start_index"]
    length = current_index - prev_start_index
    chord_used["length"] = length
    data_to_return.append(chord_used)

    return data_to_return

def most_likely_chord(possible_chords):
    """
    Finds the most likely chord from a list of possible chords based on weightings.

    :param possible_chords: Dictionary of chords and their weightings.
    :return: The most likely chord.
    """

    # Sort dictionary by value in descending order, and pick the top element
    sorted_dict = dict(sorted(possible_chords.items(), key=lambda item: item[1], reverse=True))
    return list(sorted_dict.keys())[0]

# Generate major and minor chord dictionaries.
# complete_chords(notes, basic_intervals_template)
#maj_chords, min_chords = complete_chords(notes, maj_template, min_template)

# Uncomment these lines to test chord dictionaries and section processing.
# print(print_chords(maj_chords))
# print(print_chords(min_chords))

# Example usage for testing purposes.
# notes_dict = {0: {'start_index': 0, 'C': 6, 'Eb': 4}, 1: {'start_index': 8}, 2: {'start_index': 16, 'C': 4, 'Eb': 4}, 3: {'start_index': 24, 'C': 8, 'Eb': 8}}
# notes_in_section(notes_dict, maj_chords, min_chords)
