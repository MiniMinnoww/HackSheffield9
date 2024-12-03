import json

from backend.constants import sort_dict_by_value_desc

try:
    with open("data/cadences.json", "r") as file:
        CADENCES = json.load(file)
except FileNotFoundError:
    with open("backend/data/cadences.json", "r") as file:
        CADENCES = json.load(file)

def get_cadenced_chords(possibilities: list):
    possibilities_copy = []
    for dictionary in possibilities:
        possibilities_copy.append((sort_dict_by_value_desc(dictionary)))

    possibilities = possibilities_copy
    print(possibilities[2])
    for index, _ in enumerate(possibilities):
        if index == 0: continue

        chord_possibilities = possibilities[index]
        chord = list(chord_possibilities.keys())[0]
        last_chord = list(possibilities[index - 1].keys())[0]

        chord_sequence = f'{last_chord},{chord}'
        print(chord_sequence)
        if chord_sequence not in list(CADENCES.keys()): continue

        possible_cadences = CADENCES[chord_sequence]

        for cadence_data in possible_cadences:
            cadence = cadence_data["cadence"]
            weight = cadence_data["weight"]

            print(f"Adding cadence weight for cadence {cadence}")

            possibilities[index - 1][cadence.split(",")[0]] += weight
            possibilities[index][cadence.split(",")[1]] += weight / 2

    possibilities[2] = sort_dict_by_value_desc(possibilities[2])
    print(possibilities[2])

    return possibilities

