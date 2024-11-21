console.log("Started JS!");

// =============================
// Constants and Variables
// =============================
const COLS = 32;
const ROWS = 50;

let returned_chords = [];
let current_key = -1;
let midi_notes = [];
let chords = [];

const midi_roll = document.getElementById("midi_roll");
const pianoRoll = document.getElementById("piano");
const bpmInput = document.getElementById("bpmInput");
const resetButton = document.getElementById("resetTable");
const goButton = document.getElementById("goButton");
const keyInput = document.getElementById("input_key");

// =============================
// Helper Functions
// =============================
let send_data = (payload) => {
    fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(response => response.json())
        .then(data => {
            returned_chords = data;
            console.log("loading data");
            let i = 0;
            for (let cell of chords) {
                if (cell.enabled) {
                    console.log(cell);
                    let root = midi_note_to_name(returned_chords[i].root);
                    let type = returned_chords[i].type;
                    console.log(root);
                    cell.setChordText(root, type);
                    i++;
                }
            }
        })
        .catch(error => console.error('Error:', error));
};

let generatePayload = () => {
    let payload = {};
    let note = 0;

    payload["speed"] = bpmInput.value;

    payload["chords"] = "";
    for (let chord of chords) {
        payload["chords"] += chord.enabled ? "1" : "0";
    }

    for (let row of midi_notes.toReversed()) {
        payload[note] = "";
        for (let cell of row) {
            payload[note] += cell.enabled ? "1" : "0";
        }
        note++;
    }

    return payload;
};

let reset = () => {
    for (let row of midi_notes) {
        for (let cell of row) {
            cell.enabled = false;
            cell.updateUI();
        }
    }

    bpmInput.value = 30;

    returned_chords = [];
    for (let chordIndex in chords) {
        chords[chordIndex].enabled = chordIndex % 8 === 0;
        chords[chordIndex].updateUI();
        chords[chordIndex].element.innerHTML = "";
    }

    localStorage.setItem('saveData', JSON.stringify(generatePayload()));
};

let save = () => {
    localStorage.setItem('saveData', JSON.stringify(generatePayload()));
};

// =============================
// Initialization Functions
// =============================
let createChordCells = () => {
    let chordRow = document.createElement("div");
    chordRow.classList.add("row");
    midi_roll.appendChild(chordRow);

    for (let n = 0; n < COLS; n++) {
        let cell = document.createElement("div");
        chordRow.appendChild(cell);
        cell.classList.add("cell");

        let chordCell = new ChordCell(n, -1, cell);
        if (n % 8 === 0) chordCell.toggle_on();

        chords.push(chordCell);
    }
};

let createPianoRoll = () => {
    pianoRoll.appendChild(document.createElement("br"));
    pianoRoll.appendChild(document.createElement("br"));

    let pianoNotes = [];
    for (let p = ROWS - 1; p >= 0; p--) {
        let cell = document.createElement("div");
        pianoRoll.appendChild(cell);
        cell.classList.add("cell");

        let pianoCell = new PianoCell(p, cell, isKeyBlack(p));
        pianoNotes.push(pianoCell);
    }
};

let createMidiRoll = () => {
    for (let i = ROWS - 1; i >= 0; i--) {
        let row = [];

        let div = document.createElement("div");
        div.classList.add("row");
        midi_roll.appendChild(div);

        for (let j = 0; j < COLS; j++) {
            let cell = document.createElement("div");
            div.appendChild(cell);
            cell.classList.add("cell");
            if (j % 8 === 0) cell.classList.add("bar-line");

            row.push(new Cell(i, j, cell));
        }
        midi_notes.push(row);
    }
};

// =============================
// Event Listeners
// =============================
goButton.addEventListener("click", () => {
    let payload = generatePayload();
    send_data(payload);
});

resetButton.addEventListener("click", () => {
    reset();
});

keyInput.onchange = (e) => {
    current_key = parseInt(keyInput.value);
    if (current_key === -1) {
        for (let row in midi_notes) {
            for (let cell of midi_notes[row]) cell.toggleInKeyStyle(false);
        }
        return;
    }

    let notes_in_key_template = [0, 2, 4, 5, 7, 9, 11];
    let notes_in_key = [];
    for (let note of notes_in_key_template) notes_in_key.push((note + current_key) % 12);

    for (let row in midi_notes) {
        for (let cell of midi_notes[row])
            cell.toggleInKeyStyle(notes_in_key.includes((cell.row % 12)));
    }
};

// =============================
// Main Execution
// =============================
createChordCells();
createPianoRoll();
createMidiRoll();

setInterval(() => { save(); }, 1000);

load_template_woo(JSON.parse(localStorage.getItem('saveData')));
