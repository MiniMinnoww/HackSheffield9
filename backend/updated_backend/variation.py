import random

RANDOM_WEIGHT: float = 8
def add_variation_to_chord_weights(possibilities: list[dict], variation_factor: float=0) -> list[dict]:
    for section in possibilities:
        for chord_possibility in section:
            section[chord_possibility] += random.uniform(0, variation_factor) * RANDOM_WEIGHT

    return possibilities

def variate_duplicate_chords(possibilities: list[dict]) -> list[dict]:
    last_chord = ""
    for section in possibilities:
        chord = list(section.keys())[0]
        if chord == last_chord:
            section[chord] -= 1
        last_chord = chord

    return possibilities