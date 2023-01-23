import React, { useRef, useState } from "react";
import ReactAudioRecorder from "../ReactAudioRecorder";
import type { ReactAudioRecorderRefHandler, ReactAudioRecorderBlobObject } from "../types";

export default function App() {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"pause" | "recording" | "stopped">("stopped");

  const audioRecorder = useRef<ReactAudioRecorderRefHandler | null>(null);

  function toggleRecording() {
    if (status === "stopped") audioRecorder.current?.start();
    else if (status === "pause") audioRecorder.current?.resume();
    else if (status === "recording") audioRecorder.current?.pause();
  }

  function onChange(blobObject: ReactAudioRecorderBlobObject) {
    if (!blobObject) return;
    setUrl(blobObject.blobURL);
  }

  function reset() {
    audioRecorder.current?.reset();
    setUrl(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ width: 300, height: 70 }}>
        <ReactAudioRecorder ref={audioRecorder} width={300} height={70} onChange={onChange} handleStatus={setStatus} />
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
