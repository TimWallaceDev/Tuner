# Guitar Tuner Web Application

A real-time guitar tuner built with React that uses the Web Audio API to detect and analyze guitar notes. The application provides accurate pitch detection and visual feedback for tuning your guitar.

## Features

- Real-time frequency analysis using the Web Audio API
- Accurate note detection for standard guitar tuning (E2 to E6)
- Visual feedback showing:
  - Current detected note
  - Frequency in Hz
  - Tuning status (Too High/Too Low/In Tune)
  - Cents deviation from perfect tuning
- Color-coded tuning indicators:
  - Green: In tune (±5 cents)
  - Orange: Close to tune (±20 cents)
  - Red: Needs significant adjustment
- Debug information panel showing microphone and audio context status

## Technical Implementation

### Core Technologies
- React.js for the user interface
- Web Audio API for real-time audio processing
- React Router for navigation

### Key Components

#### Frequency Analysis
The application uses the Web Audio API's `AnalyserNode` with the following configuration:
- FFT size: 2048 for optimal frequency resolution
- Frequency range: 80Hz to 1320Hz (covers standard guitar tuning)
- Amplitude threshold: -50 dB to filter out background noise

#### Note Detection
- Comprehensive database of standard guitar tuning frequencies (E2 to E6)
- Real-time frequency to note conversion
- Cents calculation for precise tuning feedback

### Audio Processing Flow
1. Microphone input is captured using `getUserMedia`
2. Audio stream is processed through the Web Audio API
3. Frequency analysis is performed using FFT
4. Dominant frequency is detected and converted to the nearest musical note
5. Tuning status is calculated and displayed in real-time

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A modern web browser with Web Audio API support

### Installation
1. Clone the repository
```bash
git clone [repository-url]
cd tuner
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Usage
1. Click "Allow Microphone Access" when prompted
2. Play a note on your guitar
3. The application will display:
   - The detected note
   - Current frequency
   - Tuning status
   - Cents deviation from perfect tuning

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Considerations
- The application uses a 2048-point FFT for optimal balance between accuracy and performance
- Frequency analysis is limited to the guitar's frequency range (80Hz-1320Hz)
- Background noise filtering is implemented to improve accuracy

## Future Improvements
- Add support for different tuning modes (Drop D, Open G, etc.)
- Implement visual waveform display
- Add calibration feature for different microphones
- Support for different instruments

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
