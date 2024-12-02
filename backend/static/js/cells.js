const SIZE_MULTIPLIER = 1

class Cell {
    constructor(row, col, div) {
        this.row = row
        this.col = col
        this.enabled = false
        this.element = div
        this.canBeToggled = true

        this.element.classList.add('cell-off')

        this.setupWidth()
        this.setupEventListeners()
        this.toggleBlackKeyStyle()
        this.toggleInKeyStyle()
    }

    setupWidth() {
        let width = (((screen.width - 200) / COLS)) * SIZE_MULTIPLIER
        this.element.style.minWidth = width + "px"
        this.element.style.maxWidth = width + "px"
        this.element.style.minHeight = (width / 2) + "px"
        this.element.style.maxHeight = (width / 2) + "px"
    }

    setupEventListeners() {
        this.element.addEventListener("mousedown", () => {this.toggle()})
        this.element.addEventListener('mouseover', (e) => {this.onMouseOver(e)})
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

        if (this.enabled && play_notes_on_click) {
            playTone(midi_note_to_freq(this.row), 500)
        }
    }

    onMouseOver(_) {
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

let type_to_display_conversion = {"maj": "", "min": "m", "dim": "°", "sus4": "sus4", "sus2": "sus2"}
class ChordCell extends Cell {
    constructor(row, col, div) {
        super(row, col, div)
        this.element.classList.remove('cell-off')
        this.element.classList.add('chord-cell-off')

        this.generateDebugDisplay()

        this.element.addEventListener("mouseover", (e) => {
            this.debugDisplay.style.top = e.positionY + "px"
            this.debugDisplay.style.left = e.positionX + "px"
            if (debug) this.setShowingDebugData(true)
        })

        this.element.addEventListener("mouseleave", (_) => {
            this.setShowingDebugData(false)
        })
    }

    setupWidth() {
        super.setupWidth()
        let width = (((screen.width - 200) / COLS)) * SIZE_MULTIPLIER
        this.element.style.minWidth = width + "px"
        this.element.style.maxWidth = width + "px"
        this.element.style.minHeight = width + "px"
        this.element.style.maxHeight = width + "px"
    }

    generateDebugDisplay() {
        this.debugDisplay = document.createElement("div")
        this.element.appendChild(this.debugDisplay)
        this.debugDisplay.classList.add('debug_display')
    }

    setShowingDebugData(showing) {
        this.debugDisplay.style.display = showing ? 'block' : 'none'
    }

    toggleBlackKeyStyle() {}

    updateUI() {
        this.element.classList.remove(this.enabled ? "chord-cell-off" : "chord-cell-on")
        this.element.classList.add(this.enabled ? "chord-cell-on" : "chord-cell-off")

        if (!this.enabled) this.element.innerHTML = ""
    }

    setChordText(root, type) {
        this.element.style.color = "#FFFFFF"
        this.element.innerHTML = "<b>" + root + "</b>" + type_to_display_conversion[type]
        this.generateDebugDisplay()
    }

    setDebugData(data) {
        if (data === undefined) return

        // Convert object to an array of [key, value] pairs
        const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

        let displayedText = ""
        let maxEntries = 5
        let entries = 0

        let total = 0
        for (const [_, value] of sortedEntries) total += value

        for (const [chord, value] of sortedEntries) {
            let chord_data = chord.split(" ")

            chord_data[0] = midi_note_to_name(chord_data[0])
            chord_data[1] = type_to_display_conversion[chord_data[1]]

            displayedText += `<b>${chord_data[0]}${chord_data[1]}</b>: ${+((value / total) * 100).toFixed(2)}%<br>`
            entries++
            if (entries >= maxEntries) break
        }

        this.debugDisplay.innerHTML = displayedText
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
        this.forceNote = false

        this.black = black

        if (black) this.element.classList.add('black-key')
        else this.element.classList.add('key')

        this.setupWidth()
        this.setupEventListeners()

    }

    forceShowingNote(showing) {
        this.forceNote = showing
        if (this.forceNote) {
            this.element.classList.add("key-force-hover")
            this.element.innerHTML = midi_note_to_name(this.row) + "_"
        }
        else {
            this.element.classList.remove("key-force-hover")
            this.element.innerHTML = ""
        }
    }

    setupWidth() {
        let width = ((screen.width - 200) / COLS) * SIZE_MULTIPLIER
        this.element.style.minWidth = width + 50 + "px"
        this.element.style.maxWidth = width + 50 + "px"
        this.element.style.minHeight = (width / 2) + "px"
        this.element.style.maxHeight = (width / 2) + "px"
        this.element.style.textAlign = "right"
    }

    setupEventListeners() {
        this.element.addEventListener("mousedown", () => {
            let freq = midi_note_to_freq(this.row)
            playTone(freq, 500)
            this.element.classList.add("key-force-hover-click")
            if (this.black) this.element.classList.add("black-key-force-hover-click")
        })

        this.element.addEventListener("mouseover", () => {
            if (mouseDown) {
                let freq = midi_note_to_freq(this.row)
                playTone(freq, 500)
                this.element.classList.add("key-force-hover-click")
                if (this.black) this.element.classList.add("black-key-force-hover-click")
            }
        })


        this.element.addEventListener("mouseenter", () => {
            this.element.style.userSelect = "none"
            this.element.innerHTML = midi_note_to_name(this.row) + "_"
        })

        this.element.addEventListener("mouseleave", () => {
            this.element.innerHTML = ""
            this.element.classList.remove("key-force-hover-click")
            if (this.black) this.element.classList.remove("black-key-force-hover-click")
        })

        this.element.addEventListener("mouseup", () => {
            this.element.classList.remove("key-force-hover-click")
            if (this.black) this.element.classList.remove("black-key-force-hover-click")
        })
    }
}
