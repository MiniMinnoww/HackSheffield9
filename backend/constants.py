notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


basic_intervals_template = {
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
    }
}

# Weightings for each interval, indicating their importance in chord identification.
weightings = {
    "I": 6,  # Root is the most important
    "II": 3, # Major/Minor second
    "III": 3, # Major/Minor third
    "IV": 4, # Perfect fourth
    "V": 5,  # Perfect fifth
    "VI": 2, # Sixth
    "VII": 1, # Seventh
}


# Example data to simulate a payload, chord profile, and note profile.
example_payload = {
    "chords": "10000000100000001000000010000000",  # Chord profile string
    "0": "11110011000000001111000011111111",     # Note profile for MIDI note 0
    "15": "00110011000000001111000011111111",    # Note profile for MIDI note 15
}
example_chord_profile = "10000000100000001000000010000000"  # Example chord profile
example_note_profile = "11110011000000001111000011111111"  # Example note profile