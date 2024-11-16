const audioContext = new (window.AudioContext || window.webkitAudioContext)();

updateCursorUI = (num) => {
    for (let row of midi_notes) for (let cell of row) cell.setCursor(cell.col === num)
}

let intervalId
let playing = false

// Function to play a tone with fade in and fade out
function playTone(frequency, duration) {
    console.log(`Playing ${frequency}`);
    const oscillator = audioContext.createOscillator();

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

    // Fade in over 0.025 seconds
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.025);  // Fade in to 0.2

    // Fade out over 0.025 seconds before stopping the sound
    setTimeout(() => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.025);  // Fade out to 0 (mute)
        oscillator.stop(audioContext.currentTime + 0.025);  // Stop the oscillator after fade-out
    }, duration - 25);  // Stop after the tone duration minus the fade-out time
}


let play = () => {
    if (playing) {
        clearInterval(intervalId);
        return
    }

    const bpm = 120;
    const interval = Math.pow(bpm / 60, -1) / 8 * 1000;  // Interval for each column in milliseconds
    let columnIndex = 0;
    updateCursorUI(0)

    // Function to play a note (this is a placeholder; replace with actual sound playback logic)
    const playRow = (row) => {
        if (midi_notes[row][columnIndex].enabled) {
            console.log(`Playing note at row ${row}, column ${columnIndex}`);

            let freq = midi_note_to_freq(row);
            playTone(freq, interval);
        }
    };

    // Function to advance to the next column and play the notes
    const playColumn = () => {
        for (let row = 0; row < ROWS; row++) {
            playRow(row);
        }

        // Move to the next column index, looping back if necessary
        columnIndex = (columnIndex + 1) % COLS;
        updateCursorUI(columnIndex)
    };

    // Interval to play notes at the correct BPM
    intervalId = setInterval(() => {
        playColumn();  // Play notes for the current column

        // Stop when you've looped through all columns (optional)
        if (columnIndex === 0) {
            clearInterval(intervalId);
        }
    }, interval);
};

document.addEventListener("keydown", function(event) {
    // Check if the pressed key is the space bar
    if (event.code === "Space" || event.key === " ") {
        play();
    }
});
