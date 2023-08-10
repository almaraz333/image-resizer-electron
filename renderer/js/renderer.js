const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please select an image file");
    return;
  }

  // Get origional dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homeDir(), "imageResizer");
}

// Send image data to main
function sendImage(e) {
  e.preventDefault(e);

  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please fill in a  height and width");
    return;
  }

  // Send to main using ipcRenderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// Catch when image done
ipcRenderer.on("image:done", () => {
  alertSuccess("Image resizzed");
});

// Make sure file is image
function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];

  return file && acceptedImageTypes.includes(file["type"]);
}

function alertSuccess(message) {
  toast.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertError(message) {
  toast.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
