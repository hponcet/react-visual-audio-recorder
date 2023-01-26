/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Visualizer } from "./Visualizer";
import { useMicrophoneRecorder } from "./useMicrophoneRecorder";

import type { ReactVisualAudioRecorderRefHandler, ReactVisualAudioRecorderProps } from "./types";

const ReactVisualAudioRecorder = forwardRef<ReactVisualAudioRecorderRefHandler, ReactVisualAudioRecorderProps>(
  (props, ref) => {
    const {
      width = 640,
      height = 100,
      onStart,
      onStop,
      onData,
      onChange,
      handleStatus,
      mimeType: _mimeType,
      ext: _ext,
      audioBitsPerSecond = 128000,
      echoCancellation = true,
      autoGainControl = true,
      noiseSuppression = true,
      showOnlyOnRecord,
      noVisualisation,
      channelCount = 2,
      backgroundColor = "rgba(255, 255, 255, 0.5)",
      strokeColor = "#000000",
      className = "visualizer",
    } = props;

    const [audioRecorderStatus, setAudioRecorderStatus] = useState<"pause" | "recording" | "stopped">("stopped");

    const visualizerRef = useRef<HTMLCanvasElement | null>(null);

    const { mimeType, ext } = useMemo(() => {
      if (_mimeType || _ext) return { mimeType: _mimeType, ext: _ext };
      if (MediaRecorder.isTypeSupported("audio/mp4")) return { mimeType: "audio/mp4", ext: "mp4" };
      if (MediaRecorder.isTypeSupported("audio/webm")) return { mimeType: "audio/webm", ext: "webm" };
      throw new Error("Your browser does not support audio recording");
    }, [_mimeType, _ext]);

    const {
      stopRecording: onStopRecording,
      pauseRecording: onPauseRecording,
      resumeRecording: onResumeRecording,
      resetRecording: onResetRecording,
      startRecording: onStartRecording,
      mediaRecorderApi,
    } = useMicrophoneRecorder({
      onStart,
      onStop,
      onChange,
      onData,
      options: {
        audioBitsPerSecond,
        mimeType,
      },
      soundOptions: {
        echoCancellation,
        autoGainControl,
        noiseSuppression,
        channelCount,
      },
    });

    useEffect(() => {
      if (!noVisualisation) {
        let animationFrame: number = -1;
        mediaRecorderApi.then((api) => {
          if (visualizerRef.current) {
            const canvasCtx = visualizerRef.current.getContext("2d");

            if (audioRecorderStatus === "recording") {
              animationFrame = Visualizer(
                canvasCtx,
                visualizerRef.current,
                api.analyser,
                width,
                height,
                backgroundColor,
                strokeColor
              );
            } else {
              canvasCtx?.clearRect(0, 0, width, height);
            }
          }
        });

        return () => {
          if (animationFrame > -1) cancelAnimationFrame(animationFrame);
        };
      }
    }, [
      audioRecorderStatus,
      visualizerRef.current,
      mediaRecorderApi,
      width,
      height,
      backgroundColor,
      strokeColor,
      noVisualisation,
    ]);

    useEffect(() => {
      if (handleStatus) handleStatus(audioRecorderStatus);
    }, [audioRecorderStatus]);

    function startRecording() {
      if (audioRecorderStatus === "stopped") onStartRecording();
      else if (audioRecorderStatus === "pause") onResumeRecording();
      setAudioRecorderStatus("recording");
    }

    function stopRecording() {
      onStopRecording();
      setAudioRecorderStatus("stopped");
    }

    function resetRecording() {
      onResetRecording();
      setAudioRecorderStatus("stopped");
    }

    function pauseRecording() {
      onPauseRecording();
      setAudioRecorderStatus("pause");
    }

    function resumeRecording() {
      if (audioRecorderStatus === "stopped") onStartRecording();
      else if (audioRecorderStatus === "pause") onResumeRecording();
      setAudioRecorderStatus("recording");
    }

    useImperativeHandle(
      ref,
      (): ReactVisualAudioRecorderRefHandler => ({
        start: startRecording,
        stop: stopRecording,
        reset: resetRecording,
        pause: pauseRecording,
        resume: resumeRecording,
        getFileExtension: () => ext,
        mediaRecorderApi,
      }),
      [audioRecorderStatus, ext]
    );

    if (noVisualisation || (showOnlyOnRecord && audioRecorderStatus !== "recording")) return null;

    return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
  }
);

export default ReactVisualAudioRecorder;
