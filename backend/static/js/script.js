console.log("Started JS!")

// Fetch data from Flask
let fetch_data = () => {
    fetch('/api/data') // Call Flask's GET endpoint
        .then(response => response.json())
        .then(data => {
            console.log(JSON.stringify(data, null, 2))
        })
        .catch(error => console.error('Error:', error));
}

// Will be a list of the chords
let returned_chords = [{ root: 0, type: "maj", length: 8 }, { root: 7, type: "maj", length: 8 }, { root: 9, type: "min", length: 8 }, { root: 5, type: "maj", length: 8 }]

// Send data to Flask
let send_data = (payload) => {
    fetch('/api/data', {method: 'POST', headers: {'Content-Type': 'application/json',}, body: JSON.stringify(payload),})
        .then(response => response.json())
        .then(data => {
            console.log(JSON.stringify(data, null, 2))
        })
        .catch(error => console.error('Error:', error));
}


const COLS = 32
const ROWS = 24

let mouseDown = false

let midi_note_to_freq = (note) => {
    return 440 * Math.pow(2, ((note + 48) - 69) / 12)
}

document.addEventListener("mousedown", () => {if (!mouseDown) mouseDown = true})
document.addEventListener("mouseup", () => {if (mouseDown) mouseDown = false})


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

    let pianoCell = new PianoCell(p, cell, [1, 3, 6, 8, 10].includes(p % 12))

    pianoNotes.push(pianoCell)
}

midi_roll.appendChild(document.createElement("br"))

// Make MIDI roll cells
for (let i = ROWS - 1; i >= 0; i--) {
    let row = []

    let div = document.createElement("div")
    div.classList.add("row")
    midi_roll.insertChild
    midi_roll.appendChild(div)

    for (let j = 0; j < COLS; j++) {
        let cell = document.createElement("div")
        div.appendChild(cell)
        cell.classList.add("cell")

        row.push(new Cell(i, j, cell))
    }
    midi_notes.push(row)


}

// Make piano roll UI

document.getElementById("goButton").addEventListener("click", (e) => {
    let generatePayload = () => {
        let payload = {}
        let note = 0

        payload["chords"] = ""
        for (let chord of chords) {
            payload["chords"] += chord.enabled ? "1" : "0"
        }

        for (let row of midi_notes) {
            payload[note] = ""
            for (let cell of row) {
                payload[note] += cell.enabled ? "1" : "0"
            }

            note++
        }

        return payload
    }

    let payload = generatePayload()
    send_data(payload)
})