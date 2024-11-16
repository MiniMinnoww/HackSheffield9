notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

maj_template = {
    "I": 0,
    "II": 2,
    "III": 4,
    "IV": 5,
    "V": 7,
    "VI": 9,
    "VII": 11,
}

min_template = {
    "I": 0,
    "II": 2,
    "III": 3,
    "IV": 5,
    "V": 7,
    "VI": 8,
    "VII": 10,
}

weightings = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6,
    "majVII": 7,
    "minVII": 8,
}

def get_related_note(note, semitones):
    return notes[(notes.index(note) + semitones) % 12]

def complete_chords(notes_list, maj_intervals, min_intervals):
    maj_dict = dict()
    min_dict = dict()
    for root in notes_list:
        maj_dict[root] = dict()
        min_dict[root] = dict()
        for note in maj_intervals:
            next_note = get_related_note(root, maj_intervals[note])
            maj_dict[root][next_note] = note
        for note in min_intervals:
            next_note = get_related_note(root, min_intervals[note])
            min_dict[root][next_note] = note
    return maj_dict, min_dict

def print_chords(chord_dict):
    output = ""
    for chord in chord_dict:
        output += chord + "\n"
        for note in chord_dict[chord]:
            output += note + ": " + chord_dict[chord][note] + "\n"
        output += "\n\n"
    return output

maj_chords, min_chords = complete_chords(notes, maj_template, min_template)

print(print_chords(maj_chords))
print(print_chords(min_chords))