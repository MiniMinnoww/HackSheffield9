# Importing necessary modules and functions from an external `logic` module.
from logic import *
from constants import *


# Function to process the payload and create a dictionary of chord changes and note information.
def create_full_chord_dict(payload):
    """
    Processes musical data from the payload to create a dictionary mapping chord changes
    to relevant MIDI note information and their prevalence.

    :param payload: Dictionary containing:
        - "chords": A string representing the chord profile.
        - Other keys: MIDI note numbers and their corresponding note profiles.
    :return: A dictionary where keys are indices of chord changes, and values are 
             dictionaries with start indices and note prevalence information.
    """
    # Initialize an empty dictionary to store chord data.
    chord_dict = dict()

    # Extract the chord profile from the payload.
    chord_profile = payload["chords"]

    # Ensure the first chord starts with "1".
    if chord_profile[0] != "1":
        chord_profile[0] = "1"

    # Identify chord change indices in the chord profile.
    chord_changes = get_chord_changes(chord_profile)

    # Create a dictionary entry for each chord change.
    for chord_change in range(len(chord_changes)):
        chord_dict[chord_change] = dict()  # Initialize a dictionary for this change.
        chord_dict[chord_change]["start_index"] = chord_changes[chord_change]  # Store start index.

    # Process each MIDI note in the payload.
    for midi_note in payload:
        try:
            # Map MIDI note number to its corresponding note name.
            note = NOTES[int(midi_note) % 12]

            # Split the note profile into sections based on the chord profile.
            note_sections = split_note_profile(payload[midi_note], chord_profile)

            # Map note prevalence to corresponding chord changes.
            for note_section in note_sections:
                if "1" in note_section:  # Only process sections that align with chords.
                    chord_dict[note_sections.index(note_section)][note] = get_note_prevalence(note_section)
        except ValueError:
            # Skip invalid MIDI note keys.
            pass

    return chord_dict


# Function to split a note profile into sections based on the chord profile.
def split_note_profile(note_profile, chord_profile):
    """
    Splits a note profile into segments aligned with the chord profile.

    :param note_profile: String representing the note's activity over time.
    :param chord_profile: String representing the chord activity over time.
    :return: List of strings, each representing the note's activity during a chord.
    """
    splits = list()  # Indices of chord changes.
    split_notes = list()  # Segments of the note profile.

    # Identify chord change positions.
    for pos in range(len(chord_profile)):
        if chord_profile[pos] == "1":
            splits.append(pos)

    # Create note segments based on chord change indices.
    for split_pos in range(len(splits)):
        if split_pos != len(splits) - 1:
            split_notes.append(note_profile[splits[split_pos]:splits[split_pos + 1]])
        else:
            split_notes.append(note_profile[splits[split_pos]:])

    return split_notes


# Function to calculate the prevalence of a note in a given section.
def get_note_prevalence(note_section):
    """
    Calculates how prevalent a note is in a section of the profile.

    :param note_section: String of binary digits representing the note's activity.
    :return: Integer representing the count of active occurrences ("1") in the section.
    """
    note_section = note_section.replace("0", "")  # Remove inactive points ("0").
    return len(note_section)  # Count the remaining active points ("1").


# Function to get the indices of chord changes in the chord profile.
def get_chord_changes(chord_profile):
    """
    Finds positions where chord changes occur in the profile.

    :param chord_profile: String representing chord activity over time.
    :return: List of indices where chord changes occur.
    """
    chord_change_pos = list()

    # Identify positions with a "1", indicating a chord change.
    for pos in range(len(chord_profile)):
        if chord_profile[pos] == "1":
            chord_change_pos.append(pos)

    return chord_change_pos


# Function to pretty-print the chord dictionary.
def print_chord_dict(chord_dict):
    """
    Prints a human-readable representation of the chord dictionary.

    :param chord_dict: Dictionary returned by create_full_chord_dict.
    """
    output = ""

    # Iterate through each chord change in the dictionary.
    for section in chord_dict:
        section_string = ""
        section_string += "Chord change " + str(section) + "\n"
        section_string += "Starts at index position " + str(chord_dict[section]["start_index"]) + "\n"

        # Print notes and their prevalence, if available.
        for note in chord_dict[section]:
            if note != "start_index":
                section_string += str(chord_dict[section][note]) + " quavers of " + note + "\n"

        output += section_string + "\n\n"

    # Uncomment the line below to print the output when running.
    # print(output)


# Function to handle received data and process it into chord mapping.
def on_data_received(payload):
    """
    Processes the incoming payload, calculates chord mappings, and returns processed data.

    :param payload: Dictionary containing musical data.
    :return: Processed data (currently undefined as data_to_return depends on external logic).
    """
    # Create a chord mapping from the payload.
    chord_map = create_full_chord_dict(payload)

    # Print the chord dictionary for testing.

    # Example of further processing (depends on external logic not included in this code).
    chords = complete_chords(NOTES, INTERVAL_TEMPLATES)  # External
    data_to_return = notes_in_section(chord_map, chords)  # External

    return data_to_return


# Entry point for the script.
if __name__ == "__main__":
    # Process the example payload and print the result.
    on_data_received(example_payload)

    # Uncomment this to print the chord dictionary of the example payload.
    # print_chord_dict(create_full_chord_dict(example_payload))
