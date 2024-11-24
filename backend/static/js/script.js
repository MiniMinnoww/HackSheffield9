// ==================================================
// VARIABLES
// ==================================================

let debug = false

let returned_chords = [];
let debug_data = [];
let current_key = -1;

// MIDI and chord data
let midi_notes = [];
let chords = [];
let pianoNotes = [];

// DOM Elements
let midi_roll = document.getElementById("midi_roll");
let pianoRoll = document.getElementById("piano");

// Constants
const COLS = 32;
const ROWS = 25;

// ==================================================
// FUNCTIONS
// ==================================================

// Send data to Flask API
const send_data = (payload) => {
    fetch('/api/data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
        returned_chords = data["data"];
        debug_data = data["debug"]
        console.log(debug_data)
        let i = 0;
        for (let cell of chords) {
            if (cell.enabled) {
                let root = midi_note_to_name(returned_chords[i].root);
                let type = returned_chords[i].type;
                cell.setChordText(root, type);
                cell.setDebugData(debug_data["chord_possibilities"][i]);
                i++;
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

// Create chord cells (the top row of cells)
const createChordCells = () => {
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
}

// Create piano roll cells (the cells with piano keys on the left)
const createPianoRollCells = () => {
    pianoRoll.appendChild(document.createElement("br"));
    pianoRoll.appendChild(document.createElement("br"));
    pianoRoll.appendChild(document.createElement("br"));
    for (let p = ROWS - 1; p >= 0; p--) {
        let cell = document.createElement("div");
        pianoRoll.appendChild(cell);
        cell.classList.add("cell");
        let pianoCell = new PianoCell(p, cell, isKeyBlack(p));
        pianoNotes.push(pianoCell);
    }
    midi_roll.appendChild(document.createElement("br"));
}

// Create MIDI roll cells (the main table)
const createMidiRollCells = () => {
    for (let i = ROWS - 1; i >= 0; i--) {
        let row = [];
        let div = document.createElement("div");
        div.classList.add("row");
        midi_roll.appendChild(div);

        // When you hover the div, it should highlight that note on the piano
        div.addEventListener("mouseover", (e) => {
            pianoNotes[ROWS - i - 1].forceShowingNote(true)
        })

        div.addEventListener("mouseout", (e) => {
            pianoNotes[ROWS - i - 1].forceShowingNote(false)
        })

        for (let j = 0; j < COLS; j++) {
            let cell = document.createElement("div");
            div.appendChild(cell);
            cell.classList.add("cell");
            if (j % 8 === 0) cell.classList.add("bar-line");
            row.push(new Cell(i, j, cell));
        }
        midi_notes.push(row);
    }
}

// Generate payload for sending
const generatePayload = () => {
    let payload = {};
    let note = 0;

    payload["speed"] = bpmInput.value;
    payload["debug"] = debug;

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
}

// Reset the state
const reset = () => {
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
    }

    localStorage.setItem('saveData', JSON.stringify(generatePayload()));
}

// Save data to local storage
const save = () => {
    localStorage.setItem('saveData', JSON.stringify(generatePayload()));
}

// Handle key input change
const handleKeyInputChange = () => {
    current_key = parseInt(key_input.value);
    if (current_key === -1) {
        for (let row in midi_notes) {
            for (let cell of midi_notes[row])
                cell.toggleInKeyStyle(false);
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
}


// ==================================================
// EVENT HANDLERS
// ==================================================

// Handle "Go" button click
document.getElementById("goButton").addEventListener("click", (e) => {
    let payload = generatePayload();
    send_data(payload);
});

// Handle reset button click
let resetButton = document.getElementById("resetTable");
resetButton.addEventListener("click", (e) => { reset(); });

// Set up auto-saving every second
setInterval(() => { save(); }, 1000);

// Handle key input change
const key_input = document.getElementById("input_key");
key_input.onchange = handleKeyInputChange;


// ==================================================
// CALLS/INITIALIZATION
// ==================================================

// Initialize the cells
createChordCells();
createPianoRollCells();
createMidiRollCells();

// Load template from local storage
load_template_woo(JSON.parse(localStorage.getItem('saveData')));

// Set initial state from localStorage
localStorage.setItem('saveData', JSON.stringify(generatePayload()));
