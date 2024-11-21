import note_convert
from constants import *

def get_all_notes(payload):
    notes = {}
    for note, note_string in payload.items():
        if note.isdigit():
            midi_note = int(note)
            notes[midi_note] = note_string.count('1')
    return notes

def get_all_notes_in_sections(notes_in_section):
    notes = {}
    for section, section_notes in notes_in_section.items():
        for note_string, appearances in section_notes.items():
            if note_string != "start_index":
                midi_note = NOTES.index(note_string)
                if midi_note not in notes: notes[midi_note] = appearances
                else: notes[midi_note] += appearances
        return notes

def get_key_centre(melody_notes):
    possibilities = {}
    total = 0

    # Go through each key
    for i in range(12):
        possibilities[i] = 0
        for note_in_scale in INTERVAL_TEMPLATES["maj"].values():
            for note in melody_notes:
                if melody_notes[note] == 0: continue
                note_mod = note % 12
                if note_mod == (note_in_scale + i) % 12:
                    possibilities[i] += melody_notes[note]
                    total += melody_notes[note]
    sorted_possibilities = dict(sorted(possibilities.items(), key=lambda item: item[1], reverse=True))
    return list(sorted_possibilities.keys())[0], f"{(sorted_possibilities[list(sorted_possibilities.keys())[0]] / total * 100)}%"

def get_weights_for_chords_in_key(notes_in_sections):
    section_key = get_key_centre(get_all_notes_in_sections(notes_in_sections))[0]

    # Firstly, convert the number in the "chords" dict into the relative numbers for the current key
    new_chords = {}
    for dict_key, item in CHORD_WEIGHTS.items():
        note = (int(dict_key[0]) + section_key) % 12
        new_chords[note_convert.NOTES[note] + dict_key[1:]] = item

    return new_chords
