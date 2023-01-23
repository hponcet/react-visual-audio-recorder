let animationFrame;
function Visualizer(canvasCtx, canvas, analyser, width, height, backgroundColor, strokeColor, frequencySize) {
    if (!canvas || !analyser || !canvasCtx)
        return -1;
    analyser.fftSize = frequencySize || 512;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, width, height);
    function draw() {
        if (!canvasCtx || !canvas)
            return -1;
        animationFrame = requestAnimationFrame(draw);
        if (!analyser) {
            canvasCtx.clearRect(0, 0, width, height);
            return -1;
        }
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = backgroundColor;
        canvasCtx.fillRect(0, 0, width, height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = strokeColor;
        canvasCtx.beginPath();
        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            }
            else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
        return animationFrame;
    }
    return draw();
}
export { Visualizer };
