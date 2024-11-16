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
    return 440 * Math.pow(2, ((note + 72) - 69) / 12)
}

document.addEventListener("mousedown", () => {if (!mouseDown) mouseDown = true})
document.addEventListener("mouseup", () => {if (mouseDown) mouseDown = false})

class Cell {
    constructor(row, col, div) {
        this.row = row
        this.col = col
        this.enabled = false
        this.element = div

        this.canBeToggled = true

        this.element.classList.add('cell-off')

        let width = (((screen.width - 200) / COLS))
        this.element.style.minWidth = width + "px"
        this.element.style.maxWidth = width + "px"
        this.element.style.minHeight = (width / 2) + "px"
        this.element.style.maxHeight = (width / 2) + "px"

        this.element.addEventListener("mousedown", () => {this.toggle()})
        this.element.addEventListener('mouseover', (e) => {
            if (mouseDown && this.canBeToggled) this.toggle()

            this.canBeToggled = false
            document.addEventListener("mouseup", () => {this.canBeToggled = true})
        })
    }

    toggle() {
        this.enabled = !this.enabled
        this.updateUI()

        if (this.enabled) {
            playTone(midi_note_to_freq(this.row), 0.75)
        }
    }

    updateUI() {
        this.element.classList.remove(this.enabled ? "cell-off" : "cell-on")
        this.element.classList.add(this.enabled ? "cell-on" : "cell-off")
    }

    setCursor(cursor) {
        if (cursor) this.element.classList.add("pointer")
        else this.element.classList.remove("pointer")
    }
}

class ChordCell extends Cell {
    constructor(row, col, div) {
        super(row, col, div)
        this.element.classList.remove('cell-off')
        this.element.classList.add('chord-cell-off')
    }
    updateUI() {
        this.element.classList.remove(this.enabled ? "chord-cell-off" : "chord-cell-on")
        this.element.classList.add(this.enabled ? "chord-cell-on" : "chord-cell-off")
    }

    toggle_on() {
        this.enabled = true
        this.updateUI()
    }
}

class PianoCell {
    constructor(row, div, black) {
        this.row = row
        this.enabled = false
        this.element = div

        if (black) this.element.classList.add('black-key')
        else this.element.classList.add('key')

        let width = (((screen.width - 200) / COLS))
        this.element.style.minWidth = width + "px"
        this.element.style.maxWidth = width + "px"
        this.element.style.minHeight = (width / 2) + "px"
        this.element.style.maxHeight = (width / 2) + "px"

        this.element.addEventListener("mousedown", () => {playTone(midi_note_to_freq(this.row), 1)})
    }
}
// Create notes
midi_notes = []
chords = []
midi_roll = document.getElementById("midi_roll")

let chordRow = document.createElement("div")
chordRow.classList.add("row")
midi_roll.appendChild(chordRow)

// Create chord cells
for (let n = 0; n < COLS; n++) {
    let cell = document.createElement("div")
    chordRow.appendChild(cell)
    cell.classList.add("cell")

    let chordCell = new ChordCell(n, -1, cell)
    if (n % 8 === 0) chordCell.toggle_on()

    chords.push(chordCell)
}

// Create piano roll
let pianoNotes = []
let pianoRoll = document.getElementById("piano")

for (let p = 0; p < ROWS; p++) {
    let cell = document.createElement("div")
    pianoRoll.appendChild(cell)
    cell.classList.add("cell")

    let pianoCell = new PianoCell(p, cell, )

    pianoNotes.push(pianoCell)
}
midi_notes.reverse() // Notes r backwards atm

midi_roll.appendChild(document.createElement("br"))

// Make MIDI roll cells
for (let i = 0; i < ROWS; i++) {
    let row = []

    let div = document.createElement("div")
    div.classList.add("row")
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