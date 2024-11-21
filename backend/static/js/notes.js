const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Updates where the cursor is on the screen
updateCursorUI = (num) => {
    for (let row of midi_notes) for (let cell of row) cell.setCursor(cell.col === num)
}

let intervalId

let bpmInput = document.getElementById("input_bpm")
let getBPM = () => {return bpmInput.value}
let interval

let recalculateInterval = () => {interval = ((60 / getBPM()) / 8) * 1000}
recalculateInterval()


let playing = false

// Function to play a tone with fade in and fade out
function playTone(frequency, duration, amp=0.2) {
    const oscillator = audioContext.createOscillator()

    const DURATION_SECONDS = duration / 1000
    const ATTACK = 0.05
    const DECAY = DURATION_SECONDS / 4
    const RELEASE = DURATION_SECONDS / 4

    // Set the oscillator frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set the waveform type (e.g., sine, square, triangle, sawtooth)
    oscillator.type = "sawtooth";

    // Create a GainNode for controlling volume
    const gainNode = audioContext.createGain();

    // Set the initial amplitude (fade-in start at 0)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Connect the oscillator to the gain node
    oscillator.connect(gainNode);

    // Connect the gain node to the audio context destination (speakers)
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // ATTACK
    gainNode.gain.linearRampToValueAtTime(amp, audioContext.currentTime + ATTACK)  // Fade in to 0.2

    // DECAY
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(amp / 2, audioContext.currentTime + DECAY )  // Fade out to sustain level (0.2)
    }, ATTACK * 1000);

    // RELEASE
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + RELEASE);  // Fade out to 0 (mute)
        oscillator.stop(audioContext.currentTime + RELEASE);  // Stop the oscillator after fade-out
    }, (ATTACK + DECAY) * 1000 );  // Stop after the tone duration minus the fade-out time
}


// Play the music currently inputted (or stop if it's already playing)
let play = () => {
    if (playing) {
        clearInterval(intervalId);
        updateCursorUI(-1)
        playing = false
        return
    }

    playing = true

    recalculateInterval()

    let columnIndex = 0;
    updateCursorUI(0)

    // Function to advance to the next column and play the notes
    const playColumn = () => {
        for (let row of midi_notes) {
            if (row[columnIndex].enabled) {
                console.log("NOTE")
                let freq = midi_note_to_freq(row[columnIndex].row);
                playTone(freq, 250);
            }
        }

        // Move to the next column index, looping back if necessary
        columnIndex = (columnIndex + 1) % COLS;
        updateCursorUI(columnIndex)
    };

    let chordList = []
    for (let obj of returned_chords) chordList.push({...obj})

    let first = true


    // Interval to play notes at the correct BPM
    intervalId = setInterval(() => {
        console.log("=================")
        playColumn();  // Play notes for the current column
        if (first && chordList.length > 0) {
            console.log("CHORD (F)")
            if (chordList[0].length === 0) chordList[0].length = COLS - columnIndex
            playChord(getChordNotes(chordList[0].root, chordList[0].type), chordList[0].length * interval)
            first = false
        }

        if (chordList.length > 0) {
            chordList[0].length--
            if (chordList[0].length === 0) {
                console.log(columnIndex)
                chordList.shift()
                first = true
                //
                // // Play the new chord
                // console.log("CHORD (N)")
                // if (chordList.length > 0) playChord(getChordNotes(chordList[0].root, chordList[0].type), chordList[0].length * interval)
            }
        }

        // Stop when you've looped through all columns
        if (columnIndex === 0) {
            clearInterval(intervalId)
            updateCursorUI(-1)
            playing = false
        }
    }, interval);
};

// Chord constructor
let getChordNotes = (root, chordType) => {
    let chord

    switch (chordType) {
        case "maj":
            chord = [root, root+4, root+7]
            break
        case "min":
            chord = [root, root+3, root+7]
            break
        case "5":
            chord = [root, root+7]
            break
        case "7":
            chord = [root, root+4, root+7, root+10]
            break
        case "dim":
            chord = [root, root+3, root+6, root+10]
            break
        default:
            chord = [root]
            break
    }

    return chord
}

let playChord = (notes, duration) => {
    for (let note of notes) {
        playTone(midi_note_to_freq(note + 12), duration, 0.1)
    }
}

// Event listeners
document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the space bar
    if (event.code === "Space" || event.key === " ") {
        play();
    }
})


