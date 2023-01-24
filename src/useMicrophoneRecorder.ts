import { useEffect, useMemo, useRef, useState } from "react";

import type { UseMicrophoneRecorderParams, UseMicrophoneRecorderContext } from "./types";

function createAudioContextCompat() {
  // @ts-ignore Compat
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error("AudioContext API is not available in the navigator.");
  return new AudioContext();
}

/**
 * Some browsers partially implement mediaDevices. We can't assign an object
 * with getUserMedia as it would overwrite existing properties
 * source:
 * https://github.com/mdn/webaudio-examples/blob/0d43048e4adcdbdefdaebf52ae85dc3e5a30d038/voice-change-o-matic/scripts/app.js#L5
 */
function olderNavigatorCompat() {
  if (navigator.mediaDevices === undefined) {
    // @ts-ignore Old navigator compatibility
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      // @ts-ignore Old navigator compatibility
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
      }

      return new Promise(function (resolve, reject) {
        console.warn("getUserMedia is in low compatibility in this browser.");
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
}

export function useMicrophoneRecorder(params: UseMicrophoneRecorderParams): UseMicrophoneRecorderContext {
  const { onStart, onStop: _onStop, onChange, onData, options, soundOptions } = params;

  const [mediaStream, setMediaStream] = useState<MediaStream | void>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | void>();
  const [audioContext, setAudioContext] = useState<AudioContext | void>();
  const [audioContextAnalyser, setAudioContextAnalyser] = useState<AnalyserNode | void>();
  const [startTime, setStartTime] = useState<number | void>();

  const chunks = useRef<Blob[]>([]);

  let constraints = useMemo(
    () => ({
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
        channelCount: 2,
        ...soundOptions,
      },
      video: false,
    }),
    [soundOptions]
  );

  function onHandleChunks(event: BlobEvent) {
    chunks.current.push(event.data);
    if (onData) onData(event.data);
  }

  function onPause() {
    if (startTime) {
      const blob = new Blob(chunks.current, { type: options.mimeType });

      const blobObject = {
        blob,
        startTime,
        stopTime: Date.now(),
        options: options,
        blobURL: window.URL.createObjectURL(blob),
      };

      if (onChange) onChange(blobObject);
    }
  }

  function onReset() {
    if (startTime) {
      chunks.current = [];

      const blobObject = {
        blob: null,
        startTime,
        stopTime: Date.now(),
        options: options,
        blobURL: null,
      };

      if (onChange) onChange(blobObject);
    }
  }

  function onStop() {
    if (startTime) {
      const blob = new Blob(chunks.current, { type: options.mimeType });
      chunks.current = [];

      const blobObject = {
        blob,
        startTime,
        stopTime: Date.now(),
        options: options,
        blobURL: window.URL.createObjectURL(blob),
      };

      if (onChange) onChange(blobObject);
      if (_onStop) _onStop(blobObject);
    }
  }

  function stopRecording() {
    onStop();
    if (mediaRecorder) {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      setMediaRecorder();
    }
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream();
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext();
    }
    if (audioContextAnalyser) {
      setAudioContextAnalyser();
    }
    setStartTime();
  }

  function pauseRecording() {
    onPause();
    audioContext?.suspend();
    mediaRecorder?.pause();
  }

  function resumeRecording() {
    audioContext?.resume();
    mediaRecorder?.resume();
  }

  function resetRecording() {
    onReset();
    stopRecording();
  }

  async function startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
          setMediaStream(mediaStream);

          let mediaRecorderInstance: MediaRecorder;

          if (options.mimeType && MediaRecorder.isTypeSupported(options.mimeType)) {
            mediaRecorderInstance = new MediaRecorder(mediaStream, options);
          } else {
            mediaRecorderInstance = new MediaRecorder(mediaStream, { ...options, mimeType: "" });
          }

          mediaRecorderInstance.addEventListener("dataavailable", onHandleChunks);

          const audioCtx = createAudioContextCompat();

          audioCtx.resume().then(() => {
            const analyser = audioCtx.createAnalyser();
            if (mediaRecorderInstance.state !== "recording") {
              mediaRecorderInstance.start(10);
            }
            const sourceNode = audioCtx.createMediaStreamSource(mediaStream);
            sourceNode.connect(analyser);

            setStartTime(Date.now());
            setMediaRecorder(mediaRecorderInstance);
            setAudioContext(audioCtx);
            setAudioContextAnalyser(analyser);
            setMediaStream(mediaStream);
            if (onStart) onStart(mediaRecorderInstance, audioCtx, mediaStream, analyser);
            resolve();
          });
        });
      } else {
        reject(new Error("Your browser does not support audio recording"));
      }
    });
  }

  useEffect(() => {
    olderNavigatorCompat();
  }, []);

  useEffect(() => {
    if (startTime) {
    }
  }, [constraints, onData, onStart, options, startTime]);

  return {
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    startRecording,
    audioContext,
    audioContextAnalyser,
  };
}
