const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.value = volume;

const handlePlayClick = (e) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const spaceKey = (e) => {
    if (e.keyCode === 32){
        handlePlayClick();
    }
}; 

const handleMute = (e) => {
    if (video.muted){
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumChange = (event) => {
    const {target: {value},} = event;
    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    };
    volumeValue = value;
    video.volume = value;
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(14,19);

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    // console.log(event.target.value);
    const {target: {value},} = event;
    video.currentTime = value;
};

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
};

const hideControls = ()  => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (controlsMovementTimeout) { // 만약 움직임을 멈춘다면 실행되지 않음
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null; // 오래된 timeout을 삭제하고 아래에서 새로운 timeout을 만듦
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000); // 만약 마우스를 움직이지 않는다면 timeout은 끝남
                                                            // but 마우스를 계속 움직인다면 handleMouseMove 함수가 빠르게 호출됨
};

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000); 
};
// 정리 => 마우스가 비디오 안에 들어가면 timeout이 시작되고 마우스를 움직이지 않으면 timeout이 잘 완료됨, 마우스를 움직이면 timeout이 취소되고 새로운 timeout이 시작함.

const handleEnded = () => { // API에 요청보내는 방법
    const { id } = videoContainer.dataset; // watch.pug에서 보내준 data-id 받는법
    fetch(`/api/videos/${id}/view`, {
        method: "post", // apiRouter에서 post로 보냈기 때문에
    });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumChange);
video.addEventListener("loadedmetadata" , handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded)
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", spaceKey);