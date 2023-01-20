/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Visualizer, MicrophoneRecorder } from "./libs";

const ReactAudioRecorder = forwardRef<ReactAudioRecorderRefHandler, ReactAudioRecorderProps>((props, ref) => {
  const {
    width = 640,
    height = 100,
    onStop,
    onStart,
    onData,
    onPause,
    handleStatus,
    audioBitsPerSecond = 128000,
    echoCancellation = false,
    autoGainControl = false,
    noiseSuppression = false,
    mimeType = "audio/webm;codecs=opus",
    backgroundColor = "rgba(255, 255, 255, 0.5)",
    strokeColor = "#000000",
    className = "visualizer",
  } = props;

  const [microphoneRecorder, setMicrophoneRecorder] = useState<MicrophoneRecorder | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [record, setRecord] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);

  const visualizerRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (microphoneRecorder) {
      if (record && canvasCtx) {
        microphoneRecorder.startRecording();
      } else {
        microphoneRecorder.stopRecording(onStop);
        canvasCtx?.clearRect(0, 0, width, height);
      }
    }
  }, [record, canvasCtx, onStop, width, height]);

  useEffect(() => {
    let animationFrame: number;
    if (record) animationFrame = Visualizer(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
    return () => {
      if (!record) cancelAnimationFrame(animationFrame);
    };
  }, [record, canvasCtx, canvas, width, height, backgroundColor, strokeColor]);

  useEffect(() => {
    if (visualizerRef.current) {
      const visualizer = visualizerRef.current;
      const canvas = visualizer;
      const canvasCtx = canvas?.getContext("2d");

      const options = {
        audioBitsPerSecond,
        mimeType,
      };

      const soundOptions = {
        echoCancellation,
        autoGainControl,
        noiseSuppression,
      };

      setCanvas(canvas);
      setCanvasCtx(canvasCtx);
      setMicrophoneRecorder(new MicrophoneRecorder(onStart, onStop, onPause, onData, options, soundOptions));
    }
  }, []);

  useEffect(() => {
    if (handleStatus) handleStatus(pause && record ? "pause" : !pause && record ? "recording" : "stopped");
  }, [pause, record]);

  useImperativeHandle(
    ref,
    () => ({
      start: () => setRecord(true),
      stop: () => setRecord(false),
      reset: () => {
        setRecord(false);
        setPause(false);
      },
      pause: () => {
        setPause(true);
        if (microphoneRecorder && record) {
          if (microphoneRecorder.recordingState === "recording") microphoneRecorder.pauseRecording();
        }
      },
      resume: () => {
        setPause(false);
        if (microphoneRecorder && record) {
          if (microphoneRecorder.recordingState === "paused") microphoneRecorder.resumeRecording();
        }
      },
    }),
    [microphoneRecorder, record]
  );

  return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
});

export default ReactAudioRecorder;
