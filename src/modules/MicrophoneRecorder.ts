import AudioContext from "./AudioContext";

type Options = MediaRecorderOptions & {
  mimeType: string;
};

let analyser: AnalyserNode;
let audioCtx: AudioContext;
let chunks: Blob[] = [];
let startTime: number;
let stream: MediaStream;
let mediaOptions: Options;
let onStartCallback: (() => void) | void;
let onChangeCallback: ((blobObject: ReactAudioRecorderBlobObject) => void) | void;
let onDataCallback: ((blob: Blob) => void) | void;
let constraints: {
  audio: {
    echoCancellation?: ReactAudioRecorderSoundOptions["echoCancellation"];
    autoGainControl?: ReactAudioRecorderSoundOptions["autoGainControl"];
    noiseSuppression?: ReactAudioRecorderSoundOptions["noiseSuppression"];
    channelCount?: ReactAudioRecorderSoundOptions["channelCount"];
  };
  video: false;
};

/**
 * Some browsers partially implement mediaDevices. We can't assign an object
 * with getUserMedia as it would overwrite existing properties
 * source:
 * https://github.com/mdn/webaudio-examples/blob/0d43048e4adcdbdefdaebf52ae85dc3e5a30d038/voice-change-o-matic/scripts/app.js#L5
 */
function olderNavigatorCompat() {
  if (navigator.mediaDevices === undefined) {
    // @ts-ignore
    navigator.mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      // @ts-ignore
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
}

export class MicrophoneRecorder {
  constructor(
    onStart: typeof onStartCallback,
    onChange: typeof onChangeCallback,
    onData: typeof onDataCallback,
    options: Options,
    soundOptions: ReactAudioRecorderSoundOptions
  ) {
    const { echoCancellation, autoGainControl, noiseSuppression, channelCount } = soundOptions;

    onStartCallback = onStart;
    onChangeCallback = onChange;
    onDataCallback = onData;
    mediaOptions = options;

    constraints = {
      audio: {
        echoCancellation,
        autoGainControl,
        noiseSuppression,
        channelCount,
      },
      video: false,
    };

    olderNavigatorCompat();
  }

  mediaRecorder: MediaRecorder | null = null;

  actionsOnStop: (() => void) | null = null;

  startRecording = () => {
    startTime = Date.now();

    this.actionsOnStop = this.onStop;

    if (this.mediaRecorder) {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
        this.mediaRecorder.resume();
        return;
      }

      if (audioCtx && this.mediaRecorder && this.mediaRecorder.state === "inactive") {
        this.mediaRecorder.start(10);
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        if (onStartCallback) onStartCallback();
      }
    } else if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia(constraints).then((mediaStrem) => {
        stream = mediaStrem;

        if (MediaRecorder.isTypeSupported(mediaOptions.mimeType)) {
          this.mediaRecorder = new MediaRecorder(mediaStrem, mediaOptions);
        } else {
          this.mediaRecorder = new MediaRecorder(mediaStrem);
        }

        if (onStartCallback) {
          onStartCallback();
        }

        this.mediaRecorder.onstop = (e) => {
          this.actionsOnStop?.();
        };

        this.mediaRecorder.onpause = () => {
          this.onPause();
        };

        this.mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);

          if (onDataCallback) onDataCallback(event.data);
        };

        audioCtx = AudioContext.getAudioContext();
        audioCtx.resume().then(() => {
          analyser = AudioContext.getAnalyser();
          this.mediaRecorder?.start(10);
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          sourceNode.connect(analyser);
        });
      });
    } else {
      alert("Your browser does not support audio recording");
    }
  };

  stopRecording(callback?: Function) {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();

      stream.getAudioTracks().forEach((track) => {
        track.stop();
      });
      this.mediaRecorder = null;
      AudioContext.resetAnalyser();
      callback?.();
    }
  }

  pauseRecording = () => {
    audioCtx?.suspend();
    this.mediaRecorder?.pause();
  };

  resumeRecording = () => {
    audioCtx?.resume();
    this.mediaRecorder?.resume();
  };

  resetRecording = () => {
    this.actionsOnStop = this.onReset;
    this.stopRecording();
  };

  onPause() {
    const blob = new Blob(chunks, { type: mediaOptions.mimeType });

    const blobObject = {
      blob,
      startTime,
      stopTime: Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(blob),
    };

    if (onChangeCallback) onChangeCallback(blobObject);
  }

  onReset() {
    chunks = [];

    const blobObject = {
      blob: null,
      startTime,
      stopTime: Date.now(),
      options: mediaOptions,
      blobURL: null,
    };

    if (onChangeCallback) onChangeCallback(blobObject);
  }

  onStop() {
    const blob = new Blob(chunks, { type: mediaOptions.mimeType });
    chunks = [];

    const blobObject = {
      blob,
      startTime,
      stopTime: Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(blob),
    };

    if (onChangeCallback) onChangeCallback(blobObject);
  }
}
