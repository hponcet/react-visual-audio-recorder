import { useEffect, useRef, useState } from "react";
import ReactAudioRecorder from "./ReactAudioRecorder";

export default function App() {
  const [record, setRecord] = useState<Blob[]>([]);
  const [mimeType, setMimeType] = useState<string>("audio/ogg; codecs=opus");
  const [file, setFile] = useState<string | void>();
  const [status, setStatus] = useState<"pause" | "recording" | "stopped">("stopped");

  const audioRecorder = useRef<ReactAudioRecorderRefHandler | null>(null);

  function toggleRecording() {
    if (status === "stopped") audioRecorder.current?.start();
    else if (status === "pause") audioRecorder.current?.resume();
    else if (status === "recording") audioRecorder.current?.pause();
  }

  function addRecord(blobObject: ReactAudioRecorderBlobObject) {
    if (!blobObject) return;
    setRecord((record) => [...record, blobObject.blob]);
    console.log(blobObject.blob.type);
    setMimeType(blobObject.blob.type);
  }

  function onPause(blobObject: ReactAudioRecorderBlobObject) {
    if (!blobObject) return;
    setRecord([blobObject.blob]);
    setMimeType(blobObject.blob.type);
  }

  function reset() {
    audioRecorder.current?.reset();
    setRecord([]);
    setFile();
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    const blob = new Blob(record, { type: mimeType });
    blobToBase64(blob).then(setFile);
  }, [mimeType, record]);

  console.log(status);

  return (
    <div>
      <button onClick={toggleRecording}>
        {status === "stopped" ? "Start recording" : status === "pause" ? "Resume" : "Pause"}
      </button>
      <button onClick={() => reset()} disabled={record.length === 0}>
        Reset
      </button>
      <ReactAudioRecorder
        ref={(ref) => {
          console.log(ref);
          audioRecorder.current = ref;
        }}
        onStop={addRecord}
        onPause={onPause}
        mimeType="audio/ogg; codecs=opus"
        handleStatus={setStatus}
      />
      {["pause", "stopped"].includes(status) ? <audio src={file || ""} controls={true} playsInline></audio> : null}
    </div>
  );
}
