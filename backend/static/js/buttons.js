class Button {
    constructor(element, callback) {
        this.element = element
        this.callback = callback

        this.registerEventListeners()
    }

    registerEventListeners() {
        this.element.addEventListener('click', this.callback)
    }
}

class ToggleButton extends Button {
    constructor(element, callback, initialState, onStyle, offStyle) {
        super(element, callback)

        this.state = initialState
        this.offStyle = offStyle
        this.onStyle = onStyle

        if (this.onStyle === "") this.onStyle = "none"
        if (this.offStyle === "") this.offStyle = "none"
    }

    setStyle() {
        if (this.state) {
            this.element.classList.remove(this.offStyle)
            this.element.classList.add(this.onStyle)
        } else {
            this.element.classList.remove(this.onStyle)
            this.element.classList.add(this.offStyle)
        }
    }

    toggleState() {
        this.state = !this.state
        this.setStyle()
    }

    setState(state) {
        this.state = state
        this.setStyle()
    }

    registerEventListeners() {
        this.element.addEventListener('click', () => {this.toggleState()})
        this.element.addEventListener('click', this.callback)
    }
}


let playButton = new ToggleButton(document.getElementById("play_button"), () => {
    play()
}, false, "play_button_on", "")

let loopButton = new ToggleButton(document.getElementById("loop_button"), () => {
    loop = loopButton.state
}, false, "loop_button_on", "")

let playNotes = new ToggleButton(document.getElementById("play_notes_on_click"), () => {
    play_notes_on_click = playNotes.element.checked
    playNotes.setState(play_notes_on_click)
}, true)

let debugButton = new ToggleButton(document.getElementById("debug_mode"), () => {
    debug = debugButton.element.checked
    debugButton.setState(debug)
}, false)

let algorithmInput = document.getElementById("input_algorithm")
algorithmInput.addEventListener("change", (e) => {
    console.log(algorithmInput.value)
    if (algorithmInput.value === "legacy") {
        // Disable a bunch of buttons that weren't available in legacy
        debug = false
        debugButton.setState(false)
        debugButton.element.checked = false
        debugButton.element.disabled = true

        variationInput.disabled = true
        variationInput.value = 0

    } else {
        debugButton.element.disabled = false
        variationInput.disabled = false
    }
})