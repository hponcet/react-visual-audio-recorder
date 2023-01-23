var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useEffect, useMemo, useRef, useState } from "react";
function createAudioContextCompat() {
    // @ts-ignore Compat
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext)
        throw new Error("AudioContext API is not available in the navigator.");
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
export function useMicrophoneRecorder(params) {
    const { onStart, onChange, onData, options, soundOptions } = params;
    const [mediaStream, setMediaStream] = useState();
    const [mediaRecorder, setMediaRecorder] = useState();
    const [audioContext, setAudioContext] = useState();
    const [audioContextAnalyser, setAudioContextAnalyser] = useState();
    const [startTime, setStartTime] = useState();
    const chunks = useRef([]);
    let constraints = useMemo(() => ({
        audio: soundOptions || {
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
            channelCount: 2,
        },
        video: false,
    }), [soundOptions]);
    function onHandleChunks(event) {
        chunks.current.push(event.data);
        if (onData)
            onData(event.data);
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
            if (onChange)
                onChange(blobObject);
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
            if (onChange)
                onChange(blobObject);
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
            if (onChange)
                onChange(blobObject);
        }
    }
    function stopRecording() {
        onStop();
        if (mediaRecorder) {
            if (mediaRecorder.state !== "inactive")
                mediaRecorder.stop();
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
        audioContext === null || audioContext === void 0 ? void 0 : audioContext.suspend();
        mediaRecorder === null || mediaRecorder === void 0 ? void 0 : mediaRecorder.pause();
    }
    function resumeRecording() {
        audioContext === null || audioContext === void 0 ? void 0 : audioContext.resume();
        mediaRecorder === null || mediaRecorder === void 0 ? void 0 : mediaRecorder.resume();
    }
    function resetRecording() {
        onReset();
        stopRecording();
    }
    function startRecording() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
                        setMediaStream(mediaStream);
                        let mediaRecorderInstance;
                        if (MediaRecorder.isTypeSupported(options.mimeType)) {
                            mediaRecorderInstance = new MediaRecorder(mediaStream, options);
                        }
                        else {
                            mediaRecorderInstance = new MediaRecorder(mediaStream);
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
                            if (onStart)
                                onStart(mediaRecorderInstance, audioCtx, mediaStream, analyser);
                            resolve();
                        });
                    });
                }
                else {
                    reject(new Error("Your browser does not support audio recording"));
                }
            });
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
