from backend.updated_backend.constants import *
import json
import logic

NUMERAL_TO_INTERVAL = {"I": 0, "II": 2, "III": 4, "IV": 5, "V": 7, "VI": 9, "VII": 11}

chords = logic.complete_chords(NOTES, INTERVAL_TEMPLATES)

with open("training_data/training_data.json", "r") as f:
    training_data = json.load(f)

def was_successful(output, expected):
    return output["root"] == expected["root"] and output["type"] == expected["type"]

PRINT_INDIVIDUALS = True


wrong = 0
right = 0
wrong_data = []
missed_types = {}

for data_point in training_data["training_data"]:
    notes = data_point["notes"]
    expected_output = data_point["output"]
    notes["start_index"] = 0
    returned_data = logic.notes_in_section({0: notes}, chords)[0]

    success = was_successful(returned_data, expected_output)
    if success:
        if PRINT_INDIVIDUALS: print(f"{Color.GREEN}Success{Color.END} - chord of {Color.BLUE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END} guessed correctly")
        right += 1


    else:
        wrong_data.append({"actual": returned_data, "expected": expected_output})

        if returned_data["root"] == expected_output["root"]:
            # Chord type was wrong, note was right
            if expected_output["type"] in missed_types:
                missed_types[expected_output["type"]] += 1
            else: missed_types[expected_output["type"]] = 1

            if PRINT_INDIVIDUALS: print(f"{Color.ORANGE}Incorrect Chord Type{Color.END} - chord of {Color.BLUE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END} was guessed as {Color.ORANGE}{NOTES[returned_data['root']] + " " + returned_data['type']}{Color.END}")
            wrong += 0.5

        else:
            if PRINT_INDIVIDUALS: print(f"{Color.RED}Incorrect Chord Root{Color.END} - chord of {Color.BLUE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END} was guessed as {Color.ORANGE}{NOTES[returned_data['root']] + " " + returned_data['type']}{Color.END}")
            wrong += 1

success = right / (wrong + right) * 100

print(f"\n{Color.HEADER}{Color.UNDERLINE}{Color.BOLD}Data{Color.END}")
print(f"Percentage Success: {Color.RED if success < 50 else Color.GREEN}{round(success, 2)}%{Color.END}")

print(f"{Color.UNDERLINE}Missed:{Color.END}")
for missed, frequency in missed_types.items():
    print(f"- {Color.BLUE}{missed}{Color.END} was missed {Color.ORANGE}{frequency}{Color.END} times.")