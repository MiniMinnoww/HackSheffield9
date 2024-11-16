dict_template = {0: {"C": 10, "Am": 6}}
main_dict = {}

notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "Ab", "A", "Bb", "B"]

def get_next_note(note: str) -> str:
    return notes[(notes.index(note) + 1) % len(notes)]
