import json

NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
INTERVAL_TEMPLATES = {
    "maj": {
        "I": 0,    # Root
        "II": 2,   # Major second
        "III": 4,  # Major third
        "IV": 5,   # Perfect fourth
        "V": 7,    # Perfect fifth
        "VI": 9,   # Major sixth
        "VII": 11, # Major seventh
    },

    "min": {
        "I": 0,    # Root
        "II": 2,   # Major second
        "III": 3,  # Minor third
        "IV": 5,   # Perfect fourth
        "V": 7,    # Perfect fifth
        "VI": 8,   # Minor sixth
        "VII": 10, # Minor seventh
    },

    "dim": {
        "I": 0,     # Root
        "III": 3,   # Minor third
        "V": 6,     # Flattened fifth
        "VI": 9,   # Major 6th
    },

    "sus4": {
            "I": 0,     # Root
            "IV": 5,    # Perfect 4th
            "V": 7,     # Perfect fifth
    },

    "sus2": {
            "I": 0,     # Root
            "II": 2,   # Perfect 4th
            "V": 7,     # Perfect fifth
    },
}

# Weightings for each interval, indicating their importance in chord identification.
try:
    with open("data/chord_weights.json", "r") as file:
        CHORD_WEIGHTS = json.load(file)
except FileNotFoundError:
    with open("backend/data/chord_weights.json", "r") as file:
        CHORD_WEIGHTS = json.load(file)

try:
    with open("data/interval_weights.json", "r") as file:
        INTERVAL_WEIGHTING = json.load(file)
except FileNotFoundError:
    with open("backend/data/interval_weights.json", "r") as file:
        INTERVAL_WEIGHTING = json.load(file)



def sort_dict_by_value_desc(dictionary: dict):
    sorted_dict = dict(sorted(dictionary.items(), key=lambda item: item[1], reverse=True))
    return sorted_dict

class Color:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    ORANGE = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'