import note_convert

new_maj_template = {
    "I": 0,    # Root
    "II": 2,   # Major second
    "III": 4,  # Major third
    "IV": 5,   # Perfect fourth
    "V": 7,    # Perfect fifth
    "VI": 9,   # Major sixth
    "VII": 11, # Major seventh
}

def get_all_notes(payload):
    notes = {}
    for note, note_string in payload.items():
        if note.isdigit():
            midi_note = int(note)
            notes[midi_note] = note_string.count('1')
    return notes

def get_key_centre(melody_notes):
    possibilities = {}
    total = 0

    # Go through each key
    for i in range(12):
        possibilities[i] = 0
        for note_in_scale in new_maj_template.values():
            for note in melody_notes:
                if melody_notes[note] == 0: continue
                note_mod = note % 12
                if note_mod == (note_in_scale + i) % 12:
                    possibilities[i] += melody_notes[note]
                    total += melody_notes[note]
    sorted_possibilities = dict(sorted(possibilities.items(), key=lambda item: item[1], reverse=True))
    print(sorted_possibilities)
    return list(sorted_possibilities.keys())[0], f"{(sorted_possibilities[list(sorted_possibilities.keys())[0]] / total * 100)}%"

def get_weights_for_chords_in_key(payload):
    section_key = get_key_centre(get_all_notes(payload))[0]

    chords = {
        "0": 4,     # Tonic
        "2m": 3,    # minor 2nd
        "4m": 3,    # Minor 3rd
        "5": 4,     # Major 4th
        "7": 4,     # Major 5th
        "9m": 4,    # Minor 6th
        "2": 2,     # Major 2nd
        "4": 2,     # Major 3rd
        "11m": 2,   # Minor 7th
        "5m": 1,    # Minor 4th
        "7m": 1     # Minor 5th
    }

    # Firstly, convert the number in the "chords" dict into the relative numbers for the current key
    new_chords = {}
    for dict_key, item in chords.items():
        note = (int(dict_key[0]) + section_key) % 12
        new_chords[note_convert.notes[note] + dict_key[1:]] = item

    return new_chords
