/// <reference types="react-scripts" />

interface ReactAudioRecorderBlobObject {
  blob: Blob;
  startTime: number;
  stopTime: number;
  options: MediaRecorderOptions;
  blobURL: string;
}

interface ReactAudioRecorderSoundOptions {
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  channelCount?: number;
}

interface ReactAudioRecorderRefHandler {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

interface ReactAudioRecorderProps {
  /** Width of the canvas. */
  width?: number;

  /** Height of the canvas. */
  height?: number;

  /**
   * Called when the recording is paused.
   * @param blobObject
   * @returns
   */
  onPause?: (blobObject: ReactAudioRecorderBlobObject) => void;

  /**
   * Called when the recording is stopped.
   * @param blobObject
   * @returns
   */
  onStop?: (blobObject: ReactAudioRecorderBlobObject) => void;

  /**
   * Called when the recording is started
   * @returns
   */
  onStart?: () => void;

  /**
   * Called during the recording.
   * @param blob
   * @returns
   */
  onData?: (blob: Blob) => void;

  /**
   * Function that handle status of the recording instance.
   * @param status
   * @returns
   */
  handleStatus: (status: "pause" | "recording" | "stopped") => void;

  /**
   * Quality of the recording in bytes/second.
   * default value: 128000
   */
  audioBitsPerSecond?: any;

  echoCancellation?: any;
  autoGainControl?: any;
  noiseSuppression?: any;

  /**
   * Sine wave spacing.
   * It should be a base 8 representation.
   * default: 512
   */
  frequencySize?: number;

  /** MimeType of the converting blob */
  mimeType?: any;

  /** backgroundColor of the curve */
  backgroundColor?: string;

  /** color of the curve */
  strokeColor?: string;

  /** style of the canvas */
  className?: string;

  /** Refs to the component function */
  ref: ForwardedRef<ReactAudioRecorderRefHandler>;
}
