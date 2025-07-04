import React, { useState, useEffect } from 'react';
import './HomePage.scss';
import TunerDisplay from '../../Components/TunerDisplay/TunerDisplay';
import { NOTE_FREQUENCIES, INSTRUMENTS_DATA } from '../../constants/tuningData';
import { Headstock } from '../../Components/HeadStock';
import { useTuner } from '../../context/TunerContext';

const HomePage = () => {
  const {
    instrument,
    setInstrument,
    tuningName,
    setTuningName,
    tuningNotes,
    frequency,
    note,
    cents
  } = useTuner();

  const [currentTargetNoteIndex, setCurrentTargetNoteIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const currentTargetNoteName = tuningNotes[currentTargetNoteIndex];
  const currentTargetNoteFrequency = NOTE_FREQUENCIES[currentTargetNoteName] || 0;

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
      console.error('Microphone access denied:', err);
      setHasPermission(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Instrument Tuner</h1>

      {/* Instrument and tuning selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div>
          <label htmlFor="instrument-select">Instrument:</label>
          <select
            id="instrument-select"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          >
            {Object.entries(INSTRUMENTS_DATA).map(([key, inst]) => (
              <option key={key} value={key}>{inst.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tuning-select">Tuning:</label>
          <select
            id="tuning-select"
            value={tuningName}
            onChange={(e) => setTuningName(e.target.value)}
          >
            {Object.entries(INSTRUMENTS_DATA[instrument].tunings).map(([key, tuning]) => (
              <option key={key} value={key}>{tuning.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Display current tuning's note buttons */}
      {tuningNotes.length > 0 && (
        <div className="tuning-notes-display">
          {[0, 1].map((side) => {
            const sideNotes = tuningNotes.filter((_, index) =>
              side === 0
                ? index < Math.ceil(tuningNotes.length / 2)
                : index >= Math.ceil(tuningNotes.length / 2)
            );
            const offset = side === 0 ? 0 : Math.ceil(tuningNotes.length / 2);

            return (
              <div key={side} className={`tuning-notes-side-${side}`}>
                {sideNotes.map((noteName, idx) => {
                  const fullIndex = idx + offset;
                  const isActive = fullIndex === currentTargetNoteIndex;

                  return (
                    <button
                      key={`${noteName}-${idx}`}
                      onClick={() => setCurrentTargetNoteIndex(fullIndex)}
                      style={{
                        border: isActive ? '2px solid #007bff' : '1px solid #ccc',
                        fontWeight: isActive ? 'bold' : 'normal',
                      }}
                    >
                      {noteName} ({NOTE_FREQUENCIES[noteName]?.toFixed(1)} Hz)
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Mic permission + tuner display */}
      <div className="tuner-container">
        {!hasPermission ? (
          <>
            <button
              onClick={requestMicrophoneAccess}
              className="mic-permission-button"
              style={{
                padding: '12px 24px',
                fontSize: '1.1rem',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🎤 Enable Microphone
            </button>
            <p style={{ marginTop: '1rem' }}>Microphone access is needed to detect pitch.</p>
          </>
        ) : (
          <>
            <TunerDisplay
              tuningNotes={tuningNotes}
              note={note}
              cents={cents}
              frequency={frequency}
              targetNoteName={currentTargetNoteName}
              targetNoteFrequency={currentTargetNoteFrequency}
              isAnalyzing={frequency > 0}
              instrumentName={INSTRUMENTS_DATA[instrument].name}
            />
            <div className="status-message">
              {frequency > 0 ? '🎵 Detecting audio...' : 'Waiting for signal...'}
            </div>
          </>
        )}
      </div>

      <Headstock instrument={instrument} />
    </div>
  );
};

export default HomePage;