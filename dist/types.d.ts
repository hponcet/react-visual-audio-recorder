import { ForwardedRef } from "react";
export interface ReactVisualAudioRecorderProps {
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
    onChange?: (blobObject: ReactVisualAudioRecorderBlobObject) => void;
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
     * Number of channels recorded.
     * Default is left and right.
     * @default 2
     */
    channelCount?: number;
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
    ref: ForwardedRef<ReactVisualAudioRecorderRefHandler>;
}
export interface ReactVisualAudioRecorderBlobObject {
    blob: Blob | null;
    startTime: number;
    stopTime: number;
    options: MediaRecorderOptions;
    blobURL: string | null;
}
export interface ReactVisualAudioRecorderSoundOptions {
    echoCancellation?: boolean;
    autoGainControl?: boolean;
    noiseSuppression?: boolean;
    channelCount?: number;
}
export interface ReactVisualAudioRecorderRefHandler {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    getFileExtension: () => string | void;
}
export interface UseMicrophoneRecorderParams {
    onStart: ((mediaRecorder: MediaRecorder, audioContext: AudioContext, mediaStream: MediaStream, analyser: AnalyserNode) => void) | void;
    onChange: ((blobObject: ReactVisualAudioRecorderBlobObject) => void) | void;
    onData: ((blob: Blob) => void) | void;
    options: {
        mimeType: string;
    } & MediaRecorderOptions;
    soundOptions?: ReactVisualAudioRecorderSoundOptions;
}
export type UseMicrophoneRecorderContext = {
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    resetRecording: () => void;
    startRecording: () => Promise<void>;
    audioContext: AudioContext | void;
    audioContextAnalyser: AnalyserNode | void;
};
