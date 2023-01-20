const AudioContext = (function () {
  let audioCtx: AudioContext;
  let analyser: AnalyserNode;

  /**
   * Initialization of an AudioContext require on chrome
   * an user gesture before. This pattern is choosen to
   * instanciate audioCtx only when the action are
   * triggered.
   *
   * https://developer.chrome.com/blog/autoplay/#webaudio
   */
  function initAndVerifyContext() {
    if (!audioCtx) audioCtx = new window.AudioContext();
    if (!analyser) analyser = audioCtx.createAnalyser();
  }

  return {
    getAudioContext() {
      initAndVerifyContext();
      return audioCtx;
    },

    getAnalyser() {
      initAndVerifyContext();
      return analyser;
    },

    resetAnalyser() {
      initAndVerifyContext();
      analyser = audioCtx.createAnalyser();
    },

    decodeAudioData(audioData: ArrayBuffer) {
      initAndVerifyContext();
      audioCtx.decodeAudioData(audioData).then((decodedData: AudioBuffer) => {
        // use the decoded data here
      });
    },
    resetAudioContext() {
      audioCtx = new window.AudioContext();
      analyser = audioCtx.createAnalyser();
    },
  };
})();

export default AudioContext;
