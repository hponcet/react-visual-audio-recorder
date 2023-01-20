const audioCtx: AudioContext = new window.AudioContext();
let analyser = audioCtx.createAnalyser();

const AudioContext = {
  getAudioContext() {
    return audioCtx;
  },

  getAnalyser() {
    return analyser;
  },

  resetAnalyser() {
    analyser = audioCtx.createAnalyser();
  },

  decodeAudioData(audioData: ArrayBuffer) {
    audioCtx.decodeAudioData(audioData).then((decodedData: AudioBuffer) => {
      // use the decoded data here
    });
  },
};

export default AudioContext;
