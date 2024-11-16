example_chord_profile = "10000000100000001000000010000000"
example_note_profile = "11110011000000001111000011111111"

def on_data_received(payload):
    return dict()

def split_note_profile(note_name, note_profile, chord_profile):
    splits = list()
    for pos in range(len(note_profile)):
        if chord_profile[pos] == "1" or (note_profile[pos] == "1" and note_profile[pos - 1] == "0"):
            pass

split_note_profile("C", example_note_profile, example_chord_profile)