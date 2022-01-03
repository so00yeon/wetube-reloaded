const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: "post",
    headers: {
      "Content-Type": "application/json", // express에게 String이 아니고 JSON을 보내고 있다고 알려주는 부분
    },
    body: JSON.stringify({ text }),
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}