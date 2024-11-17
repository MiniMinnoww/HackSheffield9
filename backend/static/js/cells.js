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
            playTone(midi_note_to_freq(this.row), 500)
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

        this.element.addEventListener("mousedown", () => {playTone(midi_note_to_freq(this.row), 500)})
    }
}
