example_chord_profile = "10000000100000001000000010000000"
example_note_profile = "11110011000000001111000011111111"

def on_data_received(payload):
    pass

def split_note_profile(note_profile, chord_profile):
    splits = list()
    for pos in range(len(chord_profile)):
        if chord_profile[pos] == "1":
            splits.append(pos)


split_note_profile(example_note_profile, example_chord_profile)