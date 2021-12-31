import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl; // 해당 url로 이동이 아니라 파일에 접근할 수 있게 해줌
  a.download = fileName; // webm은 확장자명인데 mp4는 안돼는 컴퓨터가 대부분이라서 지금은 webm을 사용함 (현재 내 컴도 안됌...)
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcording...";

  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true }); // log 는 무슨일이 벌어지고 있는지 콘솔에서 확인하고 싶어서 사용
  await ffmpeg.load(); // 사용자가 javaScript가 아닌 코드를 사용해서, 우리 웹사이트에서 다른 소프트웨어를 사용 (소프트웨어가 무거울 수 있기 때문에 기다려줘야한다.)

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output); // 이 코드가 실행 후 가상 파일 시스템에 output.mp4라는 파일이 있음

  await ffmpeg.run(
    // 썸네일을 저장한다.
    "-i",
    files.input, // 인풋
    "-ss",
    "00:00:01", // 00:00:01 시간대를 찾고
    "-frames:v",
    "1", // 한장
    files.thumb
  ); //  위의 .webm으로부터.jpg를 원한다.

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  // 메모리에 파일들이 남아있으면 브라우저가 느려질 수 있으니 삭제해준다.
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);
  // URL 삭제
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); // createObjectURL은 우리가 브라우저의 메모리 상에 있는 파일에 접근할 수 있는 방법,
    // 실제로 존재 X, 브라우저가 열려있는 상태에서만 존재
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
        width: 1024,
        height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
  // Uncaught ReferenceError: regeneratorRuntime is not defined 에러가 발생하는 이유는
  // 프론트엔드에서 await, async 를 사용하기 위해 regeneratorRuntime를 설치해야하기 때문이다. 결론 => 그냥 설치하면 됨 ^~^
};

init();

actionBtn.addEventListener("click", handleStart);
