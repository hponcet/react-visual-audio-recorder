/// <reference types="react-scripts" />

interface ReactAudioRecorderBlobObject {
  blob: Blob | null;
  startTime: number;
  stopTime: number;
  options: MediaRecorderOptions;
  blobURL: string | null;
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
  /**
   * Width of the canvas.
   * @default 640
   */
  width?: number;

  /**
   * Height of the canvas.
   * @default 100
   */
  height?: number;

  /**
   * Called when the recording is stopped or paused. All chunks
   * are sended as a blob.
   * @param blobObject
   * @returns
   */
  onChange?: (blobObject: ReactAudioRecorderBlobObject) => void;

  /**
   * Called when the recording is started
   * @returns
   */
  onStart?: () => void;

  /**
   * Called during the recording. Sending all chunks as blob
   * during the recording.
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
   * @default 128000
   */
  audioBitsPerSecond?: any;

  /**
   * Reduce echo digitally
   * @default true
   */
  echoCancellation?: boolean;

  /**
   * Reduce echo digitally
   * @default true
   */
  autoGainControl?: boolean;

  /**
   * Suppresses background noise
   * @default true
   */
  noiseSuppression?: boolean;

  /**
   * Sine wave spacing.
   * It should be a base 8 representation.
   * @default 512
   */
  frequencySize?: number;

  /**
   * MimeType of the converting blob
   * @default "audio/ogg; codecs=vorbis"
   * @external https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter
   * @external https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#audio_and_video_types
   */
  mimeType?: any;

  /**
   * BackgroundColor of the curve.
   * @default "rgba(255, 255, 255, 0.5)"
   */
  backgroundColor?: string;

  /**
   * Color of the curve.
   * @default #000000
   */
  strokeColor?: string;

  /** style of the canvas */
  className?: string;

  /** Refs to the component function */
  ref: ForwardedRef<ReactAudioRecorderRefHandler>;
}
