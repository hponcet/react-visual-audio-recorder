# ReactVisualAudioRecorder

A simple audio recorder compatible with a large part of the browsers.

## ReactVisualAudioRecorder component

This component has been designed to render a sound wave when recording audio.
The recording control functions are done via the `ref` of the component and the recording via the `onData` props for controlled and continuous recording or via the `onChange` props for data recording during breaks (pause/stop).

## API Reference

#### ReactVisualAudioRecorder component props

None of the props are required

| Parameter            | Type                                                               | Default                    | Description                                                                                       |
| :------------------- | :----------------------------------------------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------ |
| `width`              | `number`                                                           | 640                        | Width of the canvas.                                                                              |
| `height`             | `number`                                                           | 100                        | Height of the canvas.                                                                             |
| `onChange`           | `(BlobObject) => void`                                             |                            | Called when the recording is stopped or paused.                                                   |
| `onStart`            | `(MediaRecorder, AudioContext, MediaStream, AnalyserNode) => void` |                            | Called when the recording is started                                                              |
| `onData`             | `(blob: Blob) => void;`                                            |                            | Called during the recording. Sending all chunks as blob during the recording.                     |
| `handleStatus`       | `(status: "pause" "recording" "stopped") => void`                  |                            | Function that handle status of the recording instance.                                            |
| `audioBitsPerSecond` | `number`                                                           | 128000                     | Quality of the recording in bytes/second.                                                         |
| `echoCancellation`   | `boolean`                                                          | true                       | Reduces the echo of the recording.                                                                |
| `autoGainControl`    | `boolean`                                                          | true                       | Control circuit in an amplifier or a chain of amplifiers.                                         |
| `noiseSuppression`   | `boolean`                                                          | true                       | Suppresses background noise of the recording.                                                     |
| `channelCount`       | `number`                                                           | 2                          | Number of channels recorded. Default is left/right for a stereo recording.                        |
| `frequencySize`      | `number`                                                           | 512                        | Sine wave spacing.                                                                                |
| `mimeType`           | `string`                                                           | Depend of browser          | https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#audio_and_video_types |
| `backgroundColor`    | `string`                                                           | `rgba(255, 255, 255, 0.5)` | BackgroundColor of the curve.                                                                     |
| `strokeColor`        | `string`                                                           | `#000000                   | Color of the curve.                                                                               |
| `className`          | `string`                                                           |                            |                                                                                                   |
| `ref`                | `(ref: ForwardedRef<ReactVisualAudioRecorderRefHandler>) => void`  |                            | Refs of the internal component functions. Setted with `useImperativeHandle`.                      |

#### ReactVisualAudioRecorderRefHandler

| function         | Type         | Description                                    |
| :--------------- | :----------- | :--------------------------------------------- |
| start            | () => void   | Start recording.                               |
| stop             | () => void   | Stop recording.                                |
| reset            | () => void   | Reset recording.                               |
| pause            | () => void   | Pause recording.                               |
| resume           | () => void   | Resume recording.                              |
| getFileExtension | () => string | Return the correct extension for the mimeType, |

## Usage/Examples

```typescript
import React, { useRef, useState } from "react";
import ReactVisualAudioRecorder from "react-visual-audio-recorder";
import type {
  ReactVisualAudioRecorderRefHandler,
  ReactVisualAudioRecorderBlobObject,
} from "react-visual-audio-recorder";

const visualizerWidth = 300;
const visualizerHeight = 70;

export default function App() {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"pause" | "recording" | "stopped">("stopped");

  const audioRecorder = useRef<ReactVisualAudioRecorderRefHandler | null>(null);

  function toggleRecording() {
    if (status === "stopped") audioRecorder.current?.start();
    else if (status === "pause") audioRecorder.current?.resume();
    else if (status === "recording") audioRecorder.current?.pause();
  }

  function onChange(blobObject: ReactVisualAudioRecorderBlobObject) {
    if (!blobObject) return;
    setUrl(blobObject.blobURL);
  }

  function reset() {
    audioRecorder.current?.reset();
    setUrl(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ width: visualizerWidth, height: visualizerHeight }}>
        <ReactVisualAudioRecorder
          ref={audioRecorder}
          width={visualizerWidth}
          height={visualizerHeight}
          onChange={onChange}
          handleStatus={setStatus}
        />
      </div>
      <div>
        <button onClick={toggleRecording}>
          {status === "stopped" ? "Start recording" : status === "pause" ? "Resume" : "Pause"}
        </button>
        <button onClick={() => reset()} disabled={!url || status === "recording"}>
          Reset
        </button>
        {url ? (
          <a href={url} download={`file.${audioRecorder.current?.getFileExtension() || "ogg"}`}>
            <button>Download</button>
          </a>
        ) : null}
      </div>
      {url ? <audio src={url || ""} controls={true} /> : null}
    </div>
  );
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
