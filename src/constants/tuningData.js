export const NOTE_FREQUENCIES = {
  C2: 65.41,
  "C#2": 69.3,
  D2: 73.42,
  "D#2": 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  "G#2": 103.83,
  A2: 110.0,
  "A#2": 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
  C6: 1046.5,
  "C#6": 1108.73,
  D6: 1174.66,
  "D#6": 1244.51,
  E6: 1318.51,
  F6: 1396.91,
  "F#6": 1479.98,
  G6: 1567.98,
  "G#6": 1661.22,
  A6: 1760.0,
  "A#6": 1864.66,
  B6: 1975.53,
  C7: 2093.0,
  B1: 61.74,
  A1: 55.0,
  E1: 41.2,
  "F#1": 46.25,
  G1: 49.0,

  // Add more notes as needed
};

export const INSTRUMENTS_DATA = {
  guitar: {
    name: "Guitar",
    defaultTuning: "standard",
    tunings: {
      standard: {
        name: "Standard E",
        notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
      },
      drop_d: {
        name: "Drop D",
        notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
      },
      double_drop_d: {
        name: "Double Drop D",
        notes: ["D2", "A2", "D3", "G3", "B3", "D4"],
      },
      dadgad: {
        name: "DADGAD",
        notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
      },
      open_d: {
        name: "Open D",
        notes: ["D2", "A2", "D3", "F#3", "A3", "D4"],
      },
      open_g: {
        name: "Open G",
        notes: ["D2", "G2", "D3", "G3", "B3", "D4"],
      },
      open_c: {
        name: "Open C",
        notes: ["C2", "G2", "C3", "G3", "C4", "E4"],
      },
      open_e: {
        name: "Open E",
        notes: ["E2", "B2", "E3", "G#3", "B3", "E4"],
      },
      open_a: {
        name: "Open A",
        notes: ["E2", "A2", "E3", "A3", "C#4", "E4"],
      },
      half_step_down: {
        name: "Half Step Down",
        notes: ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"],
      },
      full_step_down: {
        name: "Full Step Down",
        notes: ["D2", "G2", "C3", "F3", "A3", "D4"],
      },
      drop_c: {
        name: "Drop C",
        notes: ["C2", "G2", "C3", "F3", "A3", "D4"],
      },
      c_standard: {
        name: "C Standard",
        notes: ["C2", "F2", "Bb2", "Eb3", "G3", "C4"],
      },
      baritone_b_standard: {
        name: "Baritone B Standard",
        notes: ["B1", "E2", "A2", "D3", "F#3", "B3"],
      },
      seven_string_b_standard: {
        name: "7-String B Standard",
        notes: ["B1", "E2", "A2", "D3", "G3", "B3", "E4"],
      },
      eight__string_f_sharp_standard: {
        name: "8-String F# Standard",
        notes: ["F#1", "B1", "E2", "A2", "D3", "G3", "B3", "E4"],
      },
    },
  },

  ukulele: {
    name: "Ukulele",
    defaultTuning: "standard_c",
    tunings: {
      standard_c: {
        name: "Standard C (GCEA, reentrant)",
        notes: ["G4", "C4", "E4", "A4"],
      },
      low_g: {
        name: "Low G (linear)",
        notes: ["G3", "C4", "E4", "A4"],
      },
      d_tuning: {
        name: "D Tuning (ADF#B)",
        notes: ["A4", "D4", "F#4", "B4"],
      },
      canadian: {
        name: "Canadian Bb Tuning (F Bb D G)",
        notes: ["F4", "Bb3", "D4", "G4"],
      },
      baritone: {
        name: "Baritone (DGBE)",
        notes: ["D3", "G3", "B3", "E4"],
      },
      sopranino: {
        name: "Sopranino (a higher GCEA)",
        notes: ["G4", "C4", "E4", "A4"],
      },
      bass: {
        name: "Bass Ukulele (EADG)",
        notes: ["E1", "A1", "D2", "G2"],
      },
    },
  },

  banjo: {
    name: "Banjo",
    defaultTuning: "open_g",
    tunings: {
      open_g: {
        name: "Standard 5-string Open G",
        notes: ["G4", "D3", "G3", "B3", "D4"],
      },
      double_c: {
        name: "Double C",
        notes: ["G4", "C3", "G3", "C4", "D4"],
      },
      sawmill: {
        name: "Sawmill / Modal G",
        notes: ["G4", "D3", "G3", "C4", "D4"],
      },
      open_d: {
        name: "Open D",
        notes: ["F#4", "D3", "F#3", "A3", "D4"],
      },
      c_tuning: {
        name: "Classic C",
        notes: ["G4", "C3", "G3", "B3", "D4"],
      },
      old_time_d: {
        name: "Old-Time D",
        notes: ["A4", "D3", "F#3", "A3", "D4"],
      },
      tenor_standard: {
        name: "Tenor Banjo Standard (Irish GDAE)",
        notes: ["G3", "D4", "A4", "E5"],
      },
      tenor_jazz: {
        name: "Tenor Banjo Jazz (CGDA)",
        notes: ["C3", "G3", "D4", "A4"],
      },
      plectrum: {
        name: "Plectrum Banjo (CGBD)",
        notes: ["C3", "G3", "B3", "D4"],
      },
      six_string_guitar: {
        name: "6-String Banjo (Guitar Tuning)",
        notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
      },
    },
  },

    cello: {
      name: "Cello",
      defaultTuning: "standard",
      tunings: {
        standard: {
          name: "Standard (CGDA)",
          notes: ["C2", "G2", "D3", "A3"],
        },
        solo: {
          name: "Solo Tuning",
          notes: ["C#2", "G#2", "D#3", "A#3"],
        },
      },
    },
  
    violin: {
      name: "Violin",
      defaultTuning: "standard",
      tunings: {
        standard: {
          name: "Standard (GDAE)",
          notes: ["G3", "D4", "A4", "E5"],
        },
        baroque: {
          name: "Baroque (one semitone lower)",
          notes: ["F#3", "C#4", "G#4", "D#5"],
        },
      },
    },
  
    bass_guitar: {
      name: "Bass Guitar",
      defaultTuning: "standard",
      tunings: {
        standard: {
          name: "Standard (EADG)",
          notes: ["E1", "A1", "D2", "G2"],
        },
        drop_d: {
          name: "Drop D",
          notes: ["D1", "A1", "D2", "G2"],
        },
        five_string: {
          name: "5-String Standard",
          notes: ["B0", "E1", "A1", "D2", "G2"],
        },
        six_string: {
          name: "6-String Standard",
          notes: ["B0", "E1", "A1", "D2", "G2", "C3"],
        },
      },
    },
  };

