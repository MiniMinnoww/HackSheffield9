const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Updates where the cursor is on the screen
updateCursorUI = (num) => {
    for (let row of midi_notes) for (let cell of row) cell.setCursor(cell.col === num)
}

let intervalId
const bpm = 100
let interval = ((60 / bpm) / 8) * 1000
console.log(interval)
let playing = false

// Function to play a tone with fade in and fade out
function playTone(frequency, duration) {
    const oscillator = audioContext.createOscillator()

    const DURATION_SECONDS = duration / 1000
    const ATTACK = DURATION_SECONDS / 4
    const DECAY = ATTACK
    const RELEASE = ATTACK

    // Set the oscillator frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set the waveform type (e.g., sine, square, triangle, sawtooth)
    oscillator.type = "sine";

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
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + ATTACK )  // Fade in to 0.2

    // DECAY
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + DECAY )  // Fade out to sustain level (0.2)
    }, (duration / 4));

    // RELEASE
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + RELEASE);  // Fade out to 0 (mute)
        oscillator.stop(audioContext.currentTime + (duration / 4));  // Stop the oscillator after fade-out
    }, 3*(duration / 4) );  // Stop after the tone duration minus the fade-out time
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

    let columnIndex = 0;
    updateCursorUI(0)

    const playRow = (row) => {
        if (midi_notes[row][columnIndex].enabled) {
            console.log(`Playing note at row ${row}, column ${columnIndex}`)
        }
    }

    // Function to advance to the next column and play the notes
    const playColumn = () => {
        for (let row of midi_notes) {
            if (row[columnIndex].enabled) {
                let freq = midi_note_to_freq(row[columnIndex].row);
                console.log(interval)
                playTone(freq, 250);
            }
        }

        // Move to the next column index, looping back if necessary
        columnIndex = (columnIndex + 1) % COLS;
        updateCursorUI(columnIndex)
    };

    let chordList = [...returned_chords]

    // Interval to play notes at the correct BPM
    intervalId = setInterval(() => {
        playColumn();  // Play notes for the current column

        if (chordList.length > 0) {
            console.log(chordList[0])
            chordList[0].length -= 1
            if (chordList[0].length === 0) {
                chordList.shift()

                // Play the new chord
                playChord(getChordNotes(chordList[0].root, chordList[0].type), chordList[0].length * interval)
            }
        }




        // Stop when you've looped through all columns (optional)
        if (columnIndex === 0) {
            clearInterval(intervalId);
            playing = false
        }
    }, interval);
};

document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the space bar
    if (event.code === "Space" || event.key === " ") {
        play();
    }
})



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
        default:
            chord = [root]
            break
    }

    return chord
}

let playChord = (notes, duration) => {
    for (let note of notes) {
        playTone(midi_note_to_freq(note + 12), duration)
    }
}
document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the enter key (Debugging)
    // TODO: REMOVE
    if (event.key === "Enter") {
        let root = parseInt(prompt("Chord Root Note"))
        let type = prompt("Chord Type")
        playChord(getChordNotes(root, type), 2000)
    }
})


