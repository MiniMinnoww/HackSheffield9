example_payload = {
    "chords": "10000000100000001000000010000000",
    "0": "11110011000000001111000011111111",
    "15": "00110011000000001111000011111111",
}
example_chord_profile = "10000000100000001000000010000000"
example_note_profile = "11110011000000001111000011111111"

notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

def create_full_chord_dict(payload):
    chord_dict = dict()
    chord_profile = payload["chords"]
    chord_changes = get_chord_changes(chord_profile)

    for chord_change in range(len(chord_changes)):
        chord_dict[chord_change] = dict()
        chord_dict[chord_change]["start_index"] = chord_changes[chord_change]

    for midi_note in payload:
        try:
            note = notes[int(midi_note) % 12]
            note_sections = split_note_profile(payload[midi_note], chord_profile)
            for note_section in note_sections:
                if "1" in note_section:
                    chord_dict[note_sections.index(note_section)][note] = get_note_prevalence(note_section)
        except ValueError:
            pass

    return chord_dict

def split_note_profile(note_profile, chord_profile):
    splits = list()
    split_notes = list()
    for pos in range(len(chord_profile)):
        if chord_profile[pos] == "1":
            splits.append(pos)
    for split_pos in range(len(splits)):
        if split_pos != len(splits)-1:
            split_notes.append(note_profile[splits[split_pos]:splits[split_pos+1]])
        else:
            split_notes.append(note_profile[splits[split_pos]:])
    return split_notes

def get_note_prevalence(note_section):
    note_section = note_section.replace("0", "")
    return len(note_section)

def get_chord_changes(chord_profile):
    chord_change_pos = list()
    for pos in range(len(chord_profile)):
        if chord_profile[pos] == "1":
            chord_change_pos.append(pos)
    return chord_change_pos

def print_chord_dict(chord_dict):
    output = ""
    for section in chord_dict:
        section_string = ""
        section_string += "Chord change " + str(section) + "\n"
        section_string += "Starts at index position " + str(chord_dict[section]["start_index"]) + "\n"
        for note in chord_dict[section]:
            if note != "start_index":
                section_string += str(chord_dict[section][note]) + " quavers of " + note + "\n"
        output += section_string + "\n\n"
    print(output)

def on_data_received(payload):
    chord_map = create_full_chord_dict(payload)

    # test starts
    print(chord_map)
    # test ends

    return dict()

# on_data_received(example_payload)

print_chord_dict(create_full_chord_dict(example_payload))