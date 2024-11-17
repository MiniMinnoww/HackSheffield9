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
    "I": 6,
    "II": 3,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 2,
    "VII": 1,
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

def check_all_chords(note, possible_chords, maj_dict, min_dict):
    for chord in maj_dict:
        if note in maj_dict[chord]:
            weighting = weightings[maj_dict[chord][note]]
            print(note, "is in", chord, "with weighting", weighting)
            if chord in possible_chords:
                possible_chords[chord]+=weighting
            else:
                possible_chords[chord]=weighting
    for chord in min_dict:
        if note in min_dict[chord]:
            weighting = weightings[min_dict[chord][note]]
            chord+="m"
            print(note, "is in", chord, "with weighting", weighting)
            if chord in possible_chords:
                possible_chords[chord]+=weighting
            else:
                possible_chords[chord]=weighting
    return possible_chords

def check_notes_in_section(notes_list, maj_dict, min_dict):
    possible_chords = dict()
    for note in notes_list:
        possible_chords=check_all_chords(note, possible_chords, maj_dict, min_dict)
    return possible_chords

def notes_in_section(notes_dict, maj_dict, min_dict):
    data_to_return = []
    i=0
    for chord_change in notes_dict:
        if i==0:
            pass
        else:
            current_index=notes_dict[chord_change]["start_index"]
            length=current_index-prev_start_index
            chord_used["length"]=length
            data_to_return.append(chord_used)
        notes_list = []
        note_prevalences=notes_dict[chord_change]
        for note in note_prevalences:
            if note == "start_index":
                prev_start_index=notes_dict[chord_change]["start_index"]
            else:
                notes_list.append(note)
        print(notes_list)
        possible_chords=check_notes_in_section(notes_list, maj_dict, min_dict)
        print(possible_chords)
        if len(notes_list) < 1:
            pass
        else:
            print(most_likely_chord(possible_chords), "is the most likely chord for this section")
            top_chord=most_likely_chord(possible_chords)
        if "m" in top_chord:
            top_chord = top_chord.replace("m","")
            print(top_chord)
            chord_used=dict()
            chord_used["root"]=int(notes.index(top_chord))
            chord_used["type"]="min"
        else:
            print(top_chord)
            chord_used=dict()
            chord_used["root"]=int(notes.index(top_chord))
            chord_used["type"]="maj"
        i+=1
    current_index = notes_dict[chord_change]["start_index"]
    length = current_index - prev_start_index
    chord_used["length"] = length
    data_to_return.append(chord_used)
    print(data_to_return)
    return data_to_return


def most_likely_chord(possible_chords):
    top_value=0
    top_chord=""
    for chord in possible_chords:
        if possible_chords[chord] > top_value:
            top_value=possible_chords[chord]
            top_chord=chord
    return top_chord

maj_chords, min_chords = complete_chords(notes, maj_template, min_template)

print(print_chords(maj_chords))
print(print_chords(min_chords))

# notes_dict = {0: {'start_index': 0, 'C': 6, 'Eb': 4}, 1: {'start_index': 8}, 2: {'start_index': 16, 'C': 4, 'Eb': 4}, 3: {'start_index': 24, 'C': 8, 'Eb': 8}}
# notes_in_section(notes_dict, maj_chords, min_chords)