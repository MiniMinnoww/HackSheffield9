console.log("Started JS!")

class Cell {
    constructor(row, col, div) {
        this.row = row
        this.col = col
        this.enabled = false
        this.element = div
    }
}

midi_notes = []
midi_roll = document.getElementById("midi_roll")

for (let i = 0; i < 12; i++) {
    let row = []

    let div = document.createElement("div")
    div.classList.add("row")
    midi_roll.appendChild(div)

    for (let j = 0; j < 12; j++) {
        let cell = document.createElement("div")
        div.appendChild(cell)
        cell.classList.add("cell")

        row.push(new Cell(i, j, div))
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