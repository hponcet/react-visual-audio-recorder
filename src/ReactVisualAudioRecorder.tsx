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
      channelCount = 2,
      backgroundColor = "rgba(255, 255, 255, 0.5)",
      strokeColor = "#000000",
      className = "visualizer",
    } = props;

    const [record, setRecord] = useState<boolean>(false);
    const [pause, setPause] = useState<boolean>(false);
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
      let animationFrame: number = -1;
      mediaRecorderApi.then((api) => {
        if (record && visualizerRef.current)
          animationFrame = Visualizer(
            visualizerRef.current.getContext("2d"),
            visualizerRef.current,
            api.analyser,
            width,
            height,
            backgroundColor,
            strokeColor
          );
      });

      return () => {
        if (animationFrame > -1) cancelAnimationFrame(animationFrame);
      };
    }, [record, visualizerRef.current, mediaRecorderApi, width, height, backgroundColor, strokeColor]);

    useEffect(() => {
      const status = pause && record ? "pause" : !pause && record ? "recording" : "stopped";
      if (handleStatus) handleStatus(status);
      setAudioRecorderStatus(status);
    }, [pause, record]);

    function startRecording() {
      if (audioRecorderStatus === "stopped") onStartRecording();
      else if (audioRecorderStatus === "pause") onResumeRecording();
      setPause(false);
      setRecord(true);
    }

    function stopRecording() {
      onStopRecording();
      setRecord(false);
      setPause(false);
    }

    function resetRecording() {
      setRecord(false);
      setPause(false);
      onResetRecording();
    }

    function pauseRecording() {
      setPause(true);
      onPauseRecording();
    }

    function resumeRecording() {
      if (audioRecorderStatus === "stopped") onStartRecording();
      else if (audioRecorderStatus === "pause") onResumeRecording();
      setRecord(true);
      setPause(false);
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
      [record]
    );

    if (showOnlyOnRecord && audioRecorderStatus !== "recording") return null;

    return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
  }
);

export default ReactVisualAudioRecorder;
