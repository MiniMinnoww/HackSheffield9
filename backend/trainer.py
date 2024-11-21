from constants import *
import note_convert
import json
import logic

chords = logic.complete_chords(NOTES, INTERVAL_TEMPLATES)

with open("training_data/training_data.json", "r") as f:
    training_data = json.load(f)

def was_successful(output, expected):
    return output["root"] == expected["root"] and output["type"] == expected["type"]

wrong = 0
right = 0

for data_point in training_data["training_data"]:
    notes = data_point["notes"]
    expected_output = data_point["output"]
    notes["start_index"] = 0
    returned_data = logic.notes_in_section({0: notes}, chords)[0]

    success = was_successful(returned_data, expected_output)
    if success:
        print(f"{Color.GREEN}Success{Color.END} - chord of {Color.BLUE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END} guessed correctly")
        right += 1
    else:
        print(f"{Color.RED}Incorrect{Color.END} - chord of {Color.BLUE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END} was guessed as {Color.ORANGE}{NOTES[expected_output['root']] + " " + expected_output['type']}{Color.END}")
        wrong += 1

success = right / (wrong + right) * 100
print(f"Percentage Success: {Color.RED if success < 50 else Color.GREEN}{success}%{Color.END}")