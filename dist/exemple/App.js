import React, { useRef, useState } from "react";
import ReactAudioRecorder from "../ReactAudioRecorder";
export default function App() {
    var _a;
    const [url, setUrl] = useState(null);
    const [status, setStatus] = useState("stopped");
    const audioRecorder = useRef(null);
    function toggleRecording() {
        var _a, _b, _c;
        if (status === "stopped")
            (_a = audioRecorder.current) === null || _a === void 0 ? void 0 : _a.start();
        else if (status === "pause")
            (_b = audioRecorder.current) === null || _b === void 0 ? void 0 : _b.resume();
        else if (status === "recording")
            (_c = audioRecorder.current) === null || _c === void 0 ? void 0 : _c.pause();
    }
    function onChange(blobObject) {
        if (!blobObject)
            return;
        setUrl(blobObject.blobURL);
    }
    function reset() {
        var _a;
        (_a = audioRecorder.current) === null || _a === void 0 ? void 0 : _a.reset();
        setUrl(null);
    }
    return (React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
        React.createElement("div", { style: { width: 300, height: 70 } },
            React.createElement(ReactAudioRecorder, { ref: audioRecorder, width: 300, height: 70, onChange: onChange, handleStatus: setStatus })),
        React.createElement("div", null,
            React.createElement("button", { onClick: toggleRecording }, status === "stopped" ? "Start recording" : status === "pause" ? "Resume" : "Pause"),
            React.createElement("button", { onClick: () => reset(), disabled: !url || status === "recording" }, "Reset"),
            url ? (React.createElement("a", { href: url, download: `file.${((_a = audioRecorder.current) === null || _a === void 0 ? void 0 : _a.getFileExtension()) || "ogg"}` },
                React.createElement("button", null, "Download"))) : null),
        url ? React.createElement("audio", { src: url || "", controls: true }) : null));
}
