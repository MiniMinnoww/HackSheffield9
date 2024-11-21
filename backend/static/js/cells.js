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
        this.element.addEventListener('mouseover', (e) => {this.onMouseOver(e)})

        this.toggleBlackKeyStyle()
        this.toggleInKeyStyle()
    }

    toggleBlackKeyStyle() {
        if (isKeyBlack(this.row)) this.element.style.backgroundColor = 'var(--greyishBackground)'
    }

    toggleInKeyStyle(i) {
        if (i) this.element.style.backgroundColor = '#edd7d7'
        else this.element.style.backgroundColor = ''
    }

    toggle() {
        this.enabled = !this.enabled
        this.updateUI()

        if (this.enabled) {
            playTone(midi_note_to_freq(this.row), 500)
        }
    }

    onMouseOver(e) {
        if (mouseDown && this.canBeToggled) this.toggle()

        this.canBeToggled = false
        document.addEventListener("mouseup", () => {this.canBeToggled = true})
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

    toggleBlackKeyStyle() {}

    updateUI() {
        this.element.classList.remove(this.enabled ? "chord-cell-off" : "chord-cell-on")
        this.element.classList.add(this.enabled ? "chord-cell-on" : "chord-cell-off")

        if (!this.enabled) this.element.innerHTML = ""
    }

    setChordText(root, type) {
        this.element.style.color = "#FFFFFF"
        let type_to_display_conversion = {"maj": "", "min": "m", "dim": "°"}
        this.element.innerHTML = "<b>" + root + "</b>" + type_to_display_conversion[type]
    }

    toggle_on() {
        this.enabled = true
        this.updateUI()
    }

    toggle() {
        this.enabled = !this.enabled
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

        let width = ((screen.width - 200) / COLS)
        this.element.style.minWidth = width + 50 + "px"
        this.element.style.maxWidth = width + 50 + "px"
        this.element.style.minHeight = (width / 2) + "px"
        this.element.style.maxHeight = (width / 2) + "px"
        this.element.style.textAlign = "right"

        this.element.addEventListener("mousedown", () => {
            let freq = midi_note_to_freq(this.row)
            playTone(freq, 500)
        })

        this.element.addEventListener("mouseover", () => {
            if (mouseDown) {
                let freq = midi_note_to_freq(this.row)
                playTone(freq, 500)
            }
        })

        this.element.addEventListener("mouseenter", () => {
            this.element.innerHTML = midi_note_to_name(row) + "_"
        })

        this.element.addEventListener("mouseleave", () => {
            this.element.innerHTML = ""
        })
    }
}
