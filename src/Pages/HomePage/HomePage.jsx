import React, { useState, useEffect } from "react";
import "./HomePage.scss";
import TunerDisplay from "../../Components/TunerDisplay/TunerDisplay";
import { NOTE_FREQUENCIES, INSTRUMENTS_DATA } from "../../constants/tuningData";
import { useTuner } from "../../context/TunerContext";
import CustomDropdown from "../../Components/CustomDropdown/CustomDropdown";
const HomePage = () => {
  const {
    instrument,
    setInstrument,
    tuningName,
    setTuningName,
    tuningNotes,
    frequency,
    note,
    cents,
  } = useTuner();

  const [currentTargetNoteIndex, setCurrentTargetNoteIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const currentTargetNoteName = tuningNotes[currentTargetNoteIndex];
  const currentTargetNoteFrequency =
    NOTE_FREQUENCIES[currentTargetNoteName] || 0;

  useEffect(() => {
    setTuningName(INSTRUMENTS_DATA[instrument].defaultTuning);
    setCurrentTargetNoteIndex(0);
  }, [instrument, setTuningName]);

  useEffect(() => {
    setCurrentTargetNoteIndex(0);
  }, [tuningName]);

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // No need to store the stream if useNoteDetector handles analysis internally
      setHasPermission(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setHasPermission(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Tuner Deluxe</h1>



      {/* Mic permission + tuner display */}
      <div className="tuner-container">
        {!hasPermission ? (
          <>
            <button
              onClick={requestMicrophoneAccess}
              className="mic-button"
            >
              🎤 Enable Microphone
            </button>
            <p>
              Microphone access is needed to detect pitch.
            </p>
          </>
        ) : (
          <>
                {/* Instrument and tuning selector */}
      <div className="instrument-select-container">
        <div>
          <label htmlFor="instrument-select">Instrument:</label>
          <CustomDropdown
            id="instrument-select"            
            value={instrument}
            onChange={setInstrument}
            options={Object.entries(INSTRUMENTS_DATA).map(([key, inst]) => ({
              value: key,
              label: inst.name,
            }))}
          />
        </div>

        <div>
          <label htmlFor="tuning-select">Tuning:</label>
          <CustomDropdown
            id="tuning-select"            
            value={tuningName}
            onChange={setTuningName}
            options={Object.entries(INSTRUMENTS_DATA[instrument].tunings).map(
              ([key, tuning]) => ({
                value: key,
                label: tuning.name,
              })
            )}
          />
        </div>
      </div>
            <TunerDisplay
              tuningNotes={tuningNotes}
              note={note}
              cents={cents}
              frequency={frequency}
              targetNoteName={currentTargetNoteName}
              targetNoteFrequency={currentTargetNoteFrequency}
              isAnalyzing={frequency > 0}
              instrumentName={INSTRUMENTS_DATA[instrument].name}
              instrument={instrument}
            />
            <div className="status-message">
              {/* {frequency > 0 ? '🎵 Detecting audio...' : 'Waiting for signal...'} */}
            </div>
            
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
