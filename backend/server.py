from flask import Flask, render_template, request, jsonify
import note_convert
from backend.logic import maj_template
from backend.note_convert import example_payload, print_chord_dict

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")  # Serve the HTML page

@app.route('/api/data', methods=['GET', 'POST'])
def api_data():
    if request.method == 'POST':
        data = request.json  # Parse JSON data from the templates
        key = get_key_centre(get_all_notes(data))
        print(f"{note_convert.notes[key[0]]} maj is the key with {key[1]} of all notes")
        # print(data)

        # data_returned = [{"root": 0, "type": "maj", "length": 8}, {"root": 7, "type": "maj", "length": 8},
        #                  {"root": 9, "type": "min", "length": 8}, {"root": 5, "type": "maj", "length": 8}]
        data_returned = note_convert.on_data_received(data)
        # print(data_returned)

        return jsonify(data_returned)
    return jsonify({"data": "Hello from the backend!"})

def get_all_notes(payload):
    notes = {}
    for note, note_string in payload.items():
        if note.isdigit():
            midi_note = int(note)
            notes[midi_note] = note_string.count('1')
    return notes

def get_key_centre(melody_notes):
    possibilities = {}
    total = 0

    # Go through each key
    for i in range(12):
        possibilities[i] = 0
        for note_in_scale in maj_template.values():
            for note in melody_notes:
                if melody_notes[note] == 0: continue
                note_mod = note % 12
                if note_mod == (note_in_scale + i) % 12:
                    possibilities[i] += melody_notes[note]
                    total += melody_notes[note]
    sorted_possibilities = dict(sorted(possibilities.items(), key=lambda item: item[1], reverse=True))
    print(sorted_possibilities)
    return list(sorted_possibilities.keys())[0], f"{(sorted_possibilities[list(sorted_possibilities.keys())[0]] / total * 100)}%"




if __name__ == '__main__':
    app.run(debug=True)