import key_centre

# List of note names representing the chromatic scale.
notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

# Dictionary representing major intervals relative to the root note.
maj_template = {
    "I": 0,    # Root
    "II": 2,   # Major second
    "III": 4,  # Major third
    "IV": 5,   # Perfect fourth
    "V": 7,    # Perfect fifth
    "VI": 9,   # Major sixth
    "VII": 11, # Major seventh
}

# Dictionary representing minor intervals relative to the root note.
min_template = {
    "I": 0,    # Root
    "II": 2,   # Major second
    "III": 3,  # Minor third
    "IV": 5,   # Perfect fourth
    "V": 7,    # Perfect fifth
    "VI": 8,   # Minor sixth
    "VII": 10, # Minor seventh
}

# Weightings for each interval, indicating their importance in chord identification.
weightings = {
    "I": 6,  # Root is the most important
    "II": 3, # Major/Minor second
    "III": 3, # Major/Minor third
    "IV": 4, # Perfect fourth
    "V": 5,  # Perfect fifth
    "VI": 2, # Sixth
    "VII": 1, # Seventh
}

def get_related_note(note, semitones):
    """
    Finds the note that is a given number of semitones away from the input note.

    :param note: The starting note.
    :param semitones: The number of semitones to move up (positive) or down (negative).
    :return: The resulting note.
    """
    return notes[(notes.index(note) + semitones) % 12]

def complete_chords(notes_list, maj_intervals, min_intervals):
    """
    Generates dictionaries of all possible major and minor chords for each note.

    :param notes_list: List of note names (e.g., ["C", "Db", ...]).
    :param maj_intervals: Dictionary of major intervals.
    :param min_intervals: Dictionary of minor intervals.
    :return: Two dictionaries (major and minor chords) with notes mapped to intervals.
    """
    maj_dict = dict()
    min_dict = dict()

    for root in notes_list:
        maj_dict[root] = dict()
        min_dict[root] = dict()

        # Calculate major chords for the root note.
        for note in maj_intervals:
            next_note = get_related_note(root, maj_intervals[note])
            maj_dict[root][next_note] = note

        # Calculate minor chords for the root note.
        for note in min_intervals:
            next_note = get_related_note(root, min_intervals[note])
            min_dict[root][next_note] = note

    return maj_dict, min_dict

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

def check_all_chords(note, possible_chords, maj_dict, min_dict):
    """
    Checks which chords (major and minor) a given note belongs to and updates their weightings.

    :param note: The note to check.
    :param possible_chords: Dictionary tracking potential chords and their weightings.
    :param maj_dict: Dictionary of major chords.
    :param min_dict: Dictionary of minor chords.
    :return: Updated possible_chords dictionary.
    """
    # Check major chords.
    for chord in maj_dict:
        if note in maj_dict[chord]:
            weighting = weightings[maj_dict[chord][note]]
            if chord in possible_chords:
                possible_chords[chord] += weighting
            else:
                possible_chords[chord] = weighting

    # Check minor chords.
    for chord in min_dict:
        if note in min_dict[chord]:
            weighting = weightings[min_dict[chord][note]]
            chord += "m"  # Append "m" to indicate minor.
            if chord in possible_chords:
                possible_chords[chord] += weighting
            else:
                possible_chords[chord] = weighting

    return possible_chords

def check_notes_in_section(notes_list, maj_dict, min_dict):
    """
    Identifies possible chords for a section based on the notes present.

    :param notes_list: List of notes in the section.
    :param maj_dict: Dictionary of major chords.
    :param min_dict: Dictionary of minor chords.
    :return: Dictionary of possible chords and their weightings.
    """
    possible_chords = dict()
    for note in notes_list:
        possible_chords = check_all_chords(note, possible_chords, maj_dict, min_dict)
    return possible_chords

def notes_in_section(notes_dict, maj_dict, min_dict, payload):
    """
    Processes a section of notes and determines the most likely chord for each section.

    :param notes_dict: Dictionary of note occurrences in each section.
    :param maj_dict: Dictionary of major chords.
    :param min_dict: Dictionary of minor chords.
    :param payload: The payload sent from the client.
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
        possible_chords = check_notes_in_section(notes_list, maj_dict, min_dict)

        extra_weights = key_centre.get_weights_for_chords_in_key(payload)
        for weight in extra_weights:
            for chord in possible_chords:
                if weight == chord:
                    print("Found equal chord")
                    possible_chords[chord] += extra_weights[weight]


        if len(notes_list) < 1:
            pass
        else:
            top_chord = most_likely_chord(possible_chords)

        # Determine chord type (major or minor).
        if "m" in top_chord:
            top_chord = top_chord.replace("m", "")
            chord_used = {
                "root": int(notes.index(top_chord)),
                "type": "min"
            }
            top_chord += "m"
        else:
            chord_used = {
                "root": int(notes.index(top_chord)),
                "type": "maj"
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
    top_value = 0
    top_chord = ""
    for chord in possible_chords:
        if possible_chords[chord] > top_value:
            top_value = possible_chords[chord]
            top_chord = chord
    return top_chord

# Generate major and minor chord dictionaries.
maj_chords, min_chords = complete_chords(notes, maj_template, min_template)

# Uncomment these lines to test chord dictionaries and section processing.
# print(print_chords(maj_chords))
# print(print_chords(min_chords))

# Example usage for testing purposes.
# notes_dict = {0: {'start_index': 0, 'C': 6, 'Eb': 4}, 1: {'start_index': 8}, 2: {'start_index': 16, 'C': 4, 'Eb': 4}, 3: {'start_index': 24, 'C': 8, 'Eb': 8}}
# notes_in_section(notes_dict, maj_chords, min_chords)
