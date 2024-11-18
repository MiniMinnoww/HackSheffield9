console.log("Started JS!")
// Will be a list of the chords
let returned_chords = []
let current_key = -1


// Send data to Flask
let send_data = (payload) => {
    fetch('/api/data', {method: 'POST', headers: {'Content-Type': 'application/json',}, body: JSON.stringify(payload),})
        .then(response => response.json())
        .then(data => {
            returned_chords = data
            console.log("loading data")
            let i = 0
            for (let cell of chords) {
                if (cell.enabled) {
                    console.log(cell)
                    let root = midi_note_to_name(returned_chords[i].root)
                    let type = returned_chords[i].type
                    console.log(root)
                    cell.setChordText(root, type)
                    i++
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

const COLS = 32
const ROWS = 25



// Create notes
midi_notes = []
chords = []
midi_roll = document.getElementById("midi_roll")

let chordRow = document.createElement("div")
chordRow.classList.add("row")
midi_roll.appendChild(chordRow)

// Create chord cells
createChordCells = () => {
    for (let n = 0; n < COLS; n++) {
        let cell = document.createElement("div")
        chordRow.appendChild(cell)
        cell.classList.add("cell")

        let chordCell = new ChordCell(n, -1, cell)
        if (n % 8 === 0) chordCell.toggle_on()

        chords.push(chordCell)
    }
}
createChordCells()

// Create piano roll
let pianoNotes = []
let pianoRoll = document.getElementById("piano")

// Give the same spacing
pianoRoll.appendChild(document.createElement("br"))
pianoRoll.appendChild(document.createElement("br"))

for (let p = ROWS - 1; p >= 0; p--) {
    let cell = document.createElement("div")
    pianoRoll.appendChild(cell)
    cell.classList.add("cell")

    let pianoCell = new PianoCell(p, cell, isKeyBlack(p))

    pianoNotes.push(pianoCell)
}

midi_roll.appendChild(document.createElement("br"))

// Make MIDI roll cells
for (let i = ROWS - 1; i >= 0; i--) {
    let row = []

    let div = document.createElement("div")
    div.classList.add("row")
    midi_roll.appendChild(div)

    for (let j = 0; j < COLS; j++) {
        let cell = document.createElement("div")
        div.appendChild(cell)
        cell.classList.add("cell")
        if (j % 8 === 0) cell.classList.add("bar-line")

        row.push(new Cell(i, j, cell))
    }
    midi_notes.push(row)


}

let generatePayload = () => {
    let payload = {}
    let note = 0

    payload["speed"] = bpmInput.value

    payload["chords"] = ""
    for (let chord of chords) {
        payload["chords"] += chord.enabled ? "1" : "0"
    }

    for (let row of midi_notes.toReversed()) {
        payload[note] = ""
        for (let cell of row) {
            payload[note] += cell.enabled ? "1" : "0"
        }

        note++
    }

    return payload
}

document.getElementById("goButton").addEventListener("click", (e) => {
    let payload = generatePayload()
    send_data(payload)
})

reset = () => {
    for (let row of midi_notes) {
        for (let cell of row) {
            cell.enabled = false
            cell.updateUI()
        }
    }

    bpmInput.value = 30

    returned_chords = []
    for (let chordIndex in chords) {
        chords[chordIndex].enabled = chordIndex % 8 === 0
        chords[chordIndex].updateUI()
    }

    localStorage.setItem('saveData', JSON.stringify(generatePayload()))
}

setInterval(() => {save()}, 1000)

let save = () => {
    localStorage.setItem('saveData', JSON.stringify(generatePayload()))
}

let resetButton = document.getElementById("resetTable")
resetButton.addEventListener("click", (e) => {reset()})

load_template_woo(JSON.parse(localStorage.getItem('saveData')))

key_input = document.getElementById("input_key")
key_input.onchange = (e) => {
    current_key = parseInt(key_input.value)
    if (current_key === -1) {
        for (let row in midi_notes) {
            for (let cell of midi_notes[row])
                cell.toggleInKeyStyle(false)
            }
        return
    }

    let notes_in_key_template = [0, 2, 4, 5, 7, 9, 11]
    let notes_in_key = []
    for (let note of notes_in_key_template) notes_in_key.push((note + current_key) % 12)

    for (let row in midi_notes) {
        for (let cell of midi_notes[row])
            cell.toggleInKeyStyle(notes_in_key.includes((cell.row % 12)))
    }
}

