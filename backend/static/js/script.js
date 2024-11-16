console.log("Started JS!")

const COLS = 32
const ROWS = 12

let mouseDown = false

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

        let width = (((screen.width - 100) / 32))
        this.element.style.minWidth = width + "px"
        this.element.style.minHeight = (width / 2) + "px"

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
    }

    updateUI() {
        this.element.classList.remove(this.enabled ? "cell-on" : "cell-off")
        this.element.classList.add(this.enabled ? "cell-on" : "cell-off")
    }
}

midi_notes = []
midi_roll = document.getElementById("midi_roll")

for (let i = 0; i < 12; i++) {
    let row = []

    let div = document.createElement("div")
    div.classList.add("row")
    midi_roll.appendChild(div)

    for (let j = 0; j < 32; j++) {
        let cell = document.createElement("div")
        div.appendChild(cell)
        cell.classList.add("cell")

        row.push(new Cell(i, j, cell))
    }
    midi_notes.push(row)


}

// // Fetch data from Flask
// fetch = () => {
//     fetch('/api/get-data') // Call Flask's GET endpoint
//         .then(response => response.json())
//         .then(data => {
//             console.log(JSON.stringify(data, null, 2))
//         })
//         .catch(error => console.error('Error:', error));
// }
//
//
// // Send data to Flask
// send = () => {
//     const payload = { name: "Alice", age: 30 }; // Example data to send
//
//     fetch('/api/post-data', { // Call Flask's POST endpoint
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log(JSON.stringify(data, null, 2))
//         })
//         .catch(error => console.error('Error:', error));
// };