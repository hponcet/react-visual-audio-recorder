/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Visualizer, MicrophoneRecorder } from "./modules";

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
    mimeType = "audio/ogg; codecs=vorbis",
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

  /** Modules initialisation */
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
      setMicrophoneRecorder(new MicrophoneRecorder(onStart, onChange, onData, options, soundOptions));
    }
  }, []);

  useEffect(() => {
    let animationFrame: number;
    if (record) animationFrame = Visualizer(canvasCtx, canvas, width, height, backgroundColor, strokeColor);
    return () => {
      if (!record) cancelAnimationFrame(animationFrame);
    };
  }, [record, canvasCtx, canvas, width, height, backgroundColor, strokeColor]);

  useEffect(() => {
    if (handleStatus) handleStatus(pause && record ? "pause" : !pause && record ? "recording" : "stopped");
  }, [pause, record]);

  function startRecording() {
    setRecord(true);
    microphoneRecorder?.startRecording();
  }

  function stopRecording() {
    setRecord(false);
    microphoneRecorder?.stopRecording();
  }

  function resetRecording() {
    setRecord(false);
    setPause(false);
    microphoneRecorder?.resetRecording();
  }

  function pauseRecording() {
    setPause(true);
    if (microphoneRecorder && record) microphoneRecorder.pauseRecording();
  }

  function resumeRecording() {
    setPause(false);
    if (microphoneRecorder && record) microphoneRecorder.resumeRecording();
  }

  useImperativeHandle(
    ref,
    () => ({
      start: startRecording,
      stop: stopRecording,
      reset: resetRecording,
      pause: pauseRecording,
      resume: resumeRecording,
    }),
    [microphoneRecorder, record, canvasCtx]
  );

  return <canvas ref={visualizerRef} height={height} width={width} className={className} />;
});

export default ReactAudioRecorder;
