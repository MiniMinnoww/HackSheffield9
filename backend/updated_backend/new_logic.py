"""
A new version of the logic that converts the payload into a list of chords for each section.
"""
import json

import backend.updated_backend.constants as constants

from backend.updated_backend.key_centre import get_key_centre, get_all_notes
import backend.updated_backend.cadences as cadences
import backend.updated_backend.variation as variation

# Constants
CHORD_TEMPLATE = {
    "maj": [0, 4, 7],
    "min": [0, 3, 7],
    "dim": [0, 3, 6],
    "sus4": [0, 5, 7],
    "sus2": [0, 2, 7],
    "7": [0, 4, 7, 10]
}

# Load interval weighting from JSON file
INTERVAL_WEIGHTING = {}
try:
    with open("../data/new_interval_weights.json", "r", encoding="utf-8") as file:
        INTERVAL_WEIGHTING = json.load(file)
except FileNotFoundError:
    with open("backend/data/new_interval_weights.json", "r", encoding="utf-8") as file:
        INTERVAL_WEIGHTING = json.load(file)


# Helper Functions
def parse_chord(chord: str):
    """
    Parses a chord string into root and chord type.

    Args:
        chord (str): The chord string in the format "root chord_type".

    Returns:
        tuple: The root as an integer and the chord type as a string.
    """
    root, chord_type = chord.split(" ")
    return int(root), chord_type


def get_all_notes_in_sections(payload: dict, offset=0) -> dict:
    """
    Extracts all notes from a payload and groups them into sections based on the chords.

    Args:
        payload (dict): The input data containing chord and note information.
        offset (int): The offset used to calculate MIDI notes.

    Returns:
        dict: A dictionary where keys are section indices and values are dictionaries
              of MIDI notes and their frequencies.
    """
    notes = {}

    # Replace initial '0' with '1' in the chords
    if payload["chords"][0] == "0":
        payload["chords"] = payload["chords"].replace("0", "1", 1)

    # Create sections based on '1's in the chord string
    for index, character in enumerate(payload["chords"]):
        if character == "1":
            notes[index] = {}

    section_indexes = list(notes.keys())

    # Process notes in each section
    for note, note_string in payload.items():
        if note.isdigit():
            for start, end in zip(section_indexes, section_indexes[1:] + [None]):
                split_note_string = note_string[start:end]
                midi_note = (int(note) - offset) % 12
                notes_in_line = split_note_string.count("1")
                notes[start][midi_note] = notes[start].get(midi_note, 0) + notes_in_line

    return notes


# Main Functions
def on_data_received(payload: dict) -> dict:
    """
    Main function to process incoming data payload and compute chords.

    Args:
        payload (dict): The input data containing chord and note information.

    Returns:
        dict: A dictionary containing the computed data and debug information.
    """
    all_notes = get_all_notes(payload=payload)
    key = get_key_centre(all_notes)

    payload_length = len(payload["0"])

    # Get notes grouped by sections and their corresponding chords
    notes = get_all_notes_in_sections(payload=payload, offset=key)
    data, debug = get_chords_from_notes_in_sections(notes, payload_length, key, float(payload["variation"]))

    return {"data": data, "debug": debug}

def get_all_chords_and_chord_weight_template() -> tuple:
    """
    Generates a list of all possible chords and their associated weight templates.

    Returns:
        tuple: A tuple containing two dictionaries:
               1. All possible chords with their notes.
               2. A template for the chord weights initialized to 0.
    """
    all_chords = {}
    chord_weights_template = {}

    for n in range(0, 12):
        for chord_type, chord_note in CHORD_TEMPLATE.items():
            all_chords[f"{n} {chord_type}"] = []
            for note in chord_note:
                all_chords[f"{n} {chord_type}"].append((note + n) % 12)
                chord_weights_template[f"{n} {chord_type}"] = 0

    return all_chords, chord_weights_template

def get_possibilities_from_notes(notes: dict):
    """
    Generates the possible chords using the basic weights from the dict of notes in sections
    :param notes: The input dict of notes in each section
    :return: A list of dicts each containing every chord with a weight assigned
    """
    possibilities = []

    # Process each section
    for _, note_dict in notes.items():
        weights = CHORD_WEIGHTS_TEMPLATE.copy()

        # Add weights for each note in the section
        for note, note_freq in note_dict.items():
            for chord, chord_notes in ALL_CHORDS.items():
                if note in chord_notes:
                    weights[chord] += note_freq * INTERVAL_WEIGHTING.get(str(note), 0)

        # Add extra chord weights
        for chord, extra_weight in constants.CHORD_WEIGHTS.items():
            if chord in weights:
                weights[chord] += extra_weight

        # Add weights to possibilities list
        possibilities.append(weights)
    return possibilities

def generate_return_data_from_possibilities(possibilities: dict, key: int, notes: dict, payload_length: int):
    """
    Takes the chord possibilities and generates the file to send back to the client, using the most likely chord

    :param possibilities: List of possible chords for each section, each with a weight
    :param key: The key offset to be added back
    :param notes: The input dict of notes in each section
    :param payload_length: The length of the full payload (the width of the MIDI input roll)
    :return: The server return data, each section is a dict as so: {"root": 0, "type": "maj", "length": 0}
    """
    return_data = []
    for idx, weights in enumerate(possibilities):
        section_data = {"root": 0, "type": "maj", "length": 0}
        poss_chords = constants.sort_dict_by_value_desc(weights)

        # Choose the best chord
        note, chord_type = parse_chord(list(poss_chords.keys())[0])
        section_data["root"] = note + key
        section_data["type"] = chord_type

        # Calculate the length of the section
        section_indexes = list(notes.keys())
        section_index = section_indexes[idx]

        try:
            next_section_index = section_indexes.index(section_index) + 1
            section_data["length"] = section_indexes[next_section_index] - section_index
        except IndexError:
            section_data["length"] = payload_length - section_index

        return_data.append(section_data)
    return return_data

def get_chords_from_notes_in_sections(notes: dict, payload_length: int, key=-1, variation_factor: float=0) -> tuple:
    """
    Analyzes notes in each section and assigns possible chords based on weights.

    :param variation_factor: The randomness applied to the chords returned
    :param dict notes: A dictionary of notes and their frequencies grouped by section.
    :param int payload_length: The length of the payload.
    :param int key: The key center used to adjust chord roots.

    :return: A tuple containing:
               1. A list of section data with root, type, and length for each section.
               2. A dictionary containing debug data about chord possibilities.
    :rtype: tuple
    """
    debug_data = {
        "chord_possibilities": []
    }

    # Get basic probabilities
    possibilities = get_possibilities_from_notes(notes)

    # Additional Processing

    # Cadences
    possibilities = cadences.get_cadenced_chords(possibilities)

    # Random variation
    possibilities = variation.add_variation_to_chord_weights(possibilities, variation_factor)

    # Turn our possibilities into return data for the server
    return_data = generate_return_data_from_possibilities(possibilities, key, notes, payload_length)

    debug_data["chord_possibilities"] = possibilities

    return return_data, debug_data

# Generate all possible chords and their weight templates
ALL_CHORDS, CHORD_WEIGHTS_TEMPLATE = get_all_chords_and_chord_weight_template()