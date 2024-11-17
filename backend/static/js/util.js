isKeyBlack = (p) => {
    return [1, 3, 6, 8, 10].includes(p % 12)
}

midi_note_to_name = (noteNumber) => {
    return notes[noteNumber % 12]
}

let notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

let mouseDown = false

let midi_note_to_freq = (note) => {
    return 440 * Math.pow(2, ((note + 48) - 69) / 12)
}

document.addEventListener("mousedown", () => {if (!mouseDown) mouseDown = true})
document.addEventListener("mouseup", () => {if (mouseDown) mouseDown = false})