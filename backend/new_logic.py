from key_centre import get_key_centre, get_all_notes
import constants
import json

CHORD_TEMPLATE = {
        "maj": [0, 4, 7],
        "min": [0, 3, 7],
        "dim": [0, 3, 6],
        "sus4": [0, 5, 7],
        "sus2": [0, 2, 7]
}

INTERVAL_WEIGHTING = {}

try:
    with open("data/new_interval_weights.json", "r") as file:
        INTERVAL_WEIGHTING = json.load(file)
except FileNotFoundError:
    with open("backend/data/new_interval_weights.json", "r") as file:
        INTERVAL_WEIGHTING = json.load(file)


def get_all_notes_in_sections(payload, offset=0):
    notes = {}

    if payload["chords"][0] == "0":
        payload["chords"] = payload["chords"].replace("0", "1", 1)

    for index, character in enumerate(payload["chords"]):
        if character == "1":
            notes[index] = {}

    section_indexes = list(notes.keys())
    for note, note_string in payload.items():
        if note.isdigit():
            for index, position in enumerate(section_indexes):
                if position != section_indexes[-1]:
                    split_note_string = note_string[position:section_indexes[index+1]]
                else:
                    split_note_string = note_string[position:]

                midi_note = (int(note) - offset) % 12
                notes[position][midi_note] = notes[position].get(midi_note, 0) + split_note_string.count('1')
    return notes

def on_data_received(payload):
    all_notes = get_all_notes(payload=payload)
    key = get_key_centre(all_notes)

    payload_length = len(payload["0"])

    notes = get_all_notes_in_sections(payload=payload, offset=key)

    return get_chords_from_notes_in_sections(notes, payload_length, key)

def get_all_chords_and_chord_weight_template():
    all_chords = {}
    chord_weights_template = {}
    for n in range(0, 12):
        for chord_type, chord_note in CHORD_TEMPLATE.items():
            all_chords[f"{n} {chord_type}"] = []
            for note in chord_note:
                all_chords[f"{n} {chord_type}"].append((note + n) % 12)
                chord_weights_template[f"{n} {chord_type}"] = 0
    return all_chords, chord_weights_template

def get_chords_from_notes_in_sections(notes, payload_length, key=-1):

    all_chords, chord_weights_template = get_all_chords_and_chord_weight_template()

    return_data = []
    for section_index, note_dict in notes.items():

        section_data = {"root": 0, "type": "maj", "length": 0}
        weights = chord_weights_template.copy()

        for note, note_freq in note_dict.items():
            for chord in all_chords:
                if note in all_chords[chord]:
                    # ADDING WEIGHT
                    weights[chord] += note_freq * INTERVAL_WEIGHTING[str(note)]

        for chord, extra_weight in constants.CHORD_WEIGHTS.items():
            if chord in weights: weights[chord] += extra_weight

        poss_chords = constants.sort_dict_by_value_desc(weights)
        printed_chords = {}
        for chord_name, weight in poss_chords.items():
            new_chord_name = constants.NOTES[(int((split := chord_name.split(" "))[0]) + key) % 12] + " " + split[1]
            printed_chords[new_chord_name] = weight

        print(printed_chords)
        chord = list(poss_chords.keys())[0]
        section_data["root"] = int(chord.split(" ")[0]) + key
        section_data["type"] = chord.split(" ")[1]

        section_indexes = list(notes.keys())

        try: section_data["length"] = section_indexes[section_indexes.index(section_index) + 1] - section_index
        except IndexError: section_data["length"] = payload_length - section_index

        return_data.append(section_data)

    return return_data