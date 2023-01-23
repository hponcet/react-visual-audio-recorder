/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Visualizer } from "./Visualizer";
import { useMicrophoneRecorder } from "./useMicrophoneRecorder";

import type { ReactAudioRecorderRefHandler, ReactAudioRecorderProps } from "./types";

const ReactAudioRecorder = forwardRef<ReactAudioRecorderRefHandler, ReactAudioRecorderProps>((props, ref) => {
  const {
    width = 640,
    height = 100,
    onStart,
    onData,
    onChange,
    handleStatus,
    audioBitsPerSecond = 128000,
    echoCancellation = true,
    autoGainControl = true,
    noiseSuppression = true,
    channelCount = 2,
    backgroundColor = "rgba(255, 255, 255, 0.5)",
    strokeColor = "#000000",
    className = "visualizer",
  } = props;

  const [record, setRecord] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);

  const visualizerRef = useRef<HTMLCanvasElement | null>(null);

  const { mimeType, ext } = useMemo(() => {
    if (MediaRecorder.isTypeSupported("audio/mp4")) return { mimeType: "audio/mp4", ext: "mp4" };
    if (MediaRecorder.isTypeSupported("audio/webm")) return { mimeType: "audio/webm", ext: "webm" };
    throw new Error("Your browser does not support audio recording");
  }, []);

  const {
    stopRecording: onStopRecording,
    pauseRecording: onPauseRecording,
    resumeRecording: onResumeRecording,
    resetRecording: onResetRecording,
    startRecording: onStartRecording,
    audioContextAnalyser,
  } = useMicrophoneRecorder({
    onStart,
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

    if (record && visualizerRef.current && audioContextAnalyser)
      animationFrame = Visualizer(
        visualizerRef.current.getContext("2d"),
        visualizerRef.current,
        audioContextAnalyser,
        width,
        height,
        backgroundColor,
        strokeColor
      );
    return () => {
      if (animationFrame > -1) cancelAnimationFrame(animationFrame);
    };
  }, [record, visualizerRef.current, audioContextAnalyser, width, height, backgroundColor, strokeColor]);

  useEffect(() => {
    if (handleStatus) handleStatus(pause && record ? "pause" : !pause && record ? "recording" : "stopped");
  }, [pause, record]);

  function startRecording() {
    onStartRecording().then(() => {
      setRecord(true);
    });
  }

  function stopRecording() {
    setRecord(false);
    onStopRecording();
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
    setPause(false);
    onResumeRecording();
  }

  useImperativeHandle(
    ref,
    (): ReactAudioRecorderRefHandler => ({
      start: startRecording,
      stop: stopRecording,
      reset: resetRecording,
      pause: pauseRecording,
      resume: resumeRecording,
      getFileExtension: () => ext,
    }),
    [record]
  );

  return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
});

export default ReactAudioRecorder;
