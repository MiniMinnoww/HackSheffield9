import random

RANDOM_WEIGHT: float = 8
def add_variation_to_chord_weights(possibilities: list[dict], variation_factor: float=0):
    for section in possibilities:
        for chord_possibility in section:
            section[chord_possibility] += random.uniform(0, variation_factor) * RANDOM_WEIGHT

    return possibilities