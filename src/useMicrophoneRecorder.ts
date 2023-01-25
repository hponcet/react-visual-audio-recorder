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

  const mediaRecorderApi = useMemo(async () => {
    if (navigator.mediaDevices) {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      let mediaRecorderInstance: MediaRecorder;

      if (options.mimeType && MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorderInstance = new MediaRecorder(mediaStream, options);
      } else {
        mediaRecorderInstance = new MediaRecorder(mediaStream, { ...options, mimeType: "" });
      }

      mediaRecorderInstance.addEventListener("dataavailable", onHandleChunks);

      const audioCtx = createAudioContextCompat();
      const analyser = audioCtx.createAnalyser();

      mediaRecorderInstance.addEventListener("start", () => {
        if (onStart) onStart(mediaRecorderInstance, audioCtx, mediaStream, analyser);
      });

      mediaRecorderInstance.addEventListener("error", (event) => {
        console.error("ReactVisualAudioRecorder", event);
      });

      audioCtx.resume().then(() => {
        const sourceNode = audioCtx.createMediaStreamSource(mediaStream);
        sourceNode.connect(analyser);
      });

      setStartTime(Date.now());

      return {
        mediaRecorder: mediaRecorderInstance,
        audioContext: audioCtx,
        analyser,
        mediaStream,
      };
    } else {
      throw new Error("Your browser does not support audio recording");
    }
  }, []);

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
    mediaRecorderApi.then(({ mediaRecorder, mediaStream, audioContext }) => {
      if (mediaRecorder) {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }
      if (mediaStream) {
        mediaStream.getAudioTracks().forEach((track) => {
          track.stop();
        });
      }
      if (audioContext) {
        audioContext.close();
      }

      setStartTime();
    });
  }

  function pauseRecording() {
    mediaRecorderApi.then(({ audioContext, mediaRecorder }) => {
      onPause();
      audioContext?.suspend();
      mediaRecorder?.pause();
    });
  }

  function resumeRecording() {
    mediaRecorderApi.then(({ audioContext, mediaRecorder }) => {
      audioContext?.resume();
      mediaRecorder?.resume();
    });
  }

  function resetRecording() {
    onReset();
    stopRecording();
  }

  function startRecording(): Promise<void> {
    return mediaRecorderApi.then((api) => {
      api.mediaRecorder.start(10);
    });
  }

  useEffect(() => {
    olderNavigatorCompat();
  }, []);

  return {
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    startRecording,
    mediaRecorderApi,
  };
}
