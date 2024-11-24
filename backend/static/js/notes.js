const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let bpmInput = document.getElementById("input_bpm");
let interval;
let intervalId;
let playing = false;
let loop = false;
let play_notes_on_click = true

// Updates where the cursor is on the screen
const updateCursorUI = (num) => {
    for (let row of midi_notes) {
        for (let cell of row) {
            cell.setCursor(cell.col === num);
        }
    }
};

const getBPM = () => bpmInput.value;

const recalculateInterval = () => {
    interval = ((60 / getBPM()) / 8) * 1000;
};
recalculateInterval();

// Function to play a tone with fade in and fade out
const playTone = (frequency, duration, amp = 0.2) => {
    const oscillator = audioContext.createOscillator();
    const DURATION_SECONDS = duration / 1000;
    const ATTACK = 0.05;
    const DECAY = DURATION_SECONDS / 4;
    const RELEASE = DURATION_SECONDS / 4;

    // Set the oscillator frequency and waveform
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = "sawtooth";

    // Create a GainNode for controlling volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Connect oscillator to gain node, then to the audio context
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    // Fade in (attack)
    gainNode.gain.linearRampToValueAtTime(amp, audioContext.currentTime + ATTACK);

    // Fade to sustain level (decay)
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(amp / 2, audioContext.currentTime + DECAY);
    }, ATTACK * 1000);

    // Fade out (release)
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + RELEASE);
        oscillator.stop(audioContext.currentTime + RELEASE);
    }, (ATTACK + DECAY) * 1000);
};

// Play the music currently inputted (or stop if already playing)
const play = () => {
    playButton.element.value = playing ? "Play" : "Stop" // Toggle back the play button
    playButton.setState(!playing)

    if (playing) {
        clearInterval(intervalId);
        updateCursorUI(-1);
        playing = false;
        return;
    }

    playing = true;

    recalculateInterval();

    let columnIndex = 0;
    updateCursorUI(0);

    // Function to advance to the next column and play the notes
    const playColumn = () => {
        for (let row of midi_notes) {
            if (row[columnIndex].enabled) {
                const freq = midi_note_to_freq(row[columnIndex].row);
                playTone(freq, 250);
            }
        }

        // Move to the next column index, looping back if necessary
        columnIndex = (columnIndex + 1) % COLS;
        updateCursorUI(columnIndex);
    };

    let chordList = returned_chords.map(obj => ({...obj}));
    let first = true;

    // Interval to play notes at the correct BPM
    intervalId = setInterval(() => {
        playColumn();

        // Handle chord play at the beginning of the loop
        if (first && chordList.length > 0) {
            if (chordList[0].length === 0) chordList[0].length = COLS - columnIndex;
            playChord(getChordNotes(chordList[0].root, chordList[0].type), chordList[0].length * interval);
            first = false;
        }

        // Handle chord length decrement and removal
        if (chordList.length > 0) {
            chordList[0].length--;
            if (chordList[0].length === 0) {
                chordList.shift();
                first = true;
            }
        }

        // Stop when you've looped through all columns
        if (columnIndex === 0) {
            if (loop) {
                chordList = returned_chords.map(obj => ({...obj}));
                first = true;
            }
            else {
                updateCursorUI(-1);
                playing = false;
                playButton.element.value = "Play"
                playButton.setState(false)
                clearInterval(intervalId);
            }

        }
    }, interval);
};

// Chord constructor
const getChordNotes = (root, chordType) => {
    let chord;

    switch (chordType) {
        case "maj":
            chord = [root, root + 4, root + 7];
            break;
        case "min":
            chord = [root, root + 3, root + 7];
            break;
        case "5":
            chord = [root, root + 7];
            break;
        case "7":
            chord = [root, root + 4, root + 7, root + 10];
            break;
        case "dim":
            chord = [root, root + 3, root + 6, root + 10];
            break;
        default:
            chord = [root];
            break;
    }

    return chord;
};

// Play a chord by playing each note
const playChord = (notes, duration) => {
    for (let note of notes) {
        playTone(midi_note_to_freq(note + 12), duration, 0.1);
    }
};

// Event listeners
document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the space bar
    if (event.code === "Space" || event.key === " ") {
        play();
    }
});
