templates = [
    {
        "0": "00000000000000000000000000000000",
        "1": "00000000000000000000000000000000",
        "2": "00000000000000000000000000000000",
        "3": "00000000000000000000000000000000",
        "4": "00000000000000000000000000000000",
        "5": "00000000000000000000000000000000",
        "6": "00000000000000000000000000000000",
        "7": "00000000000000000000000000000000",
        "8": "00000000000000000000000000000000",
        "9": "00000000000000000000000000000000",
        "10": "00000000000000000000000000000000",
        "11": "00000000000000000000000000000000",
        "12": "10100000000000000000000000001000",
        "13": "00000000000000000000000000000000",
        "14": "00000000000000000000000010100000",
        "15": "00000000000000000000000000000000",
        "16": "00000000000000000000101000000000",
        "17": "00000000000000001010000000000000",
        "18": "00000000000000000000000000000000",
        "19": "00001010000010000000000000000000",
        "20": "00000000000000000000000000000000",
        "21": "00000000101000000000000000000000",
        "22": "00000000000000000000000000000000",
        "23": "00000000000000000000000000000000",
        "24": "00000000000000000000000000000000",
        "chords": "10000000100010001000000010001000",
        "name": "Twinkle Twinkle"
    }
]

load_template = (index) => {
    let template = templates[index]

    for (idx in template["chords"]) {
        char = template["chords"][idx]
        chords[idx].enabled = char === "1"
        chords[idx].updateUI()
    }
    for ([key, value] of Object.entries(template)) {
        if (key === "chords") {
            return
        }

        // Get row
        let row = ROWS - 1 - parseInt(key) // For some reason u gotta -1 maybe indexing
        for (let cellIndex in midi_notes[row]) {
            let cell = midi_notes[row][cellIndex]
            cell.enabled = template[key][cellIndex] === "1"
            cell.updateUI()
        }
    }
}

document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the space bar
    if (event.code === "Enter" || event.key === "Enter") {
        console.log(generatePayload())
    }
})

// Generate buttons
let templateHolder = document.getElementById("templates")

for (let templateIndex in templates) {
    let template = templates[templateIndex]
    let button = document.createElement("input");
    button.type = "button"
    button.value = template["name"]
    button.addEventListener("click", () => {
        load_template(templateIndex)
    })

    templateHolder.appendChild(button)
}
