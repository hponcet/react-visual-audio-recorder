import AudioContext from "./AudioContext";

let animationFrame: number;

function Visualizer(
  canvasCtx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  backgroundColor: string,
  strokeColor: string,
  frequencySize: number | void
): number {
  if (!canvasCtx || !canvas) return -1;

  let analyser = AudioContext.getAnalyser();

  analyser.fftSize = frequencySize || 512;

  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  canvasCtx.clearRect(0, 0, width, height);

  function draw() {
    if (!canvasCtx || !canvas) return -1;

    animationFrame = requestAnimationFrame(draw);

    analyser = AudioContext.getAnalyser();
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
      } else {
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
