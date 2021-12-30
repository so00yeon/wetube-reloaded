const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoFile; // 해당 url로 이동이 아니라 파일에 접근할 수 있게 해줌
    a.download = "Myrecording.webm"; // webm은 확장자명인데 mp4는 안돼는 컴퓨터가 대부분이라서 지금은 webm을 사용함 (현재 내 컴도 안됌...)
    document.body.appendChild(a);
    a.click();
};

const handleStop = () => {
    startBtn.innerText = "Download Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);
    recorder.stop();
}

const handleStart = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    recorder = new MediaRecorder(stream, {mimeType: "video/webm"});
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data); // createObjectURL은 우리가 브라우저의 메모리 상에 있는 파일에 접근할 수 있는 방법, 
                                                    // 실제로 존재 X, 브라우저가 열려있는 상태에서만 존재
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
}

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    });
    video.srcObject = stream;
    video.play();
    // Uncaught ReferenceError: regeneratorRuntime is not defined 에러가 발생하는 이유는 
    // 프론트엔드에서 await, async 를 사용하기 위해 regeneratorRuntime를 설치해야하기 때문이다. 결론 => 그냥 설치하면 됨 ^~^
};

init();

startBtn.addEventListener("click", handleStart);