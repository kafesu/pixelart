const toggleGridlinesBtn = document.getElementById("toggle-gridlines");
const colorGrabber = document.getElementById("color-grabber");
const colorInput = document.getElementById("color-input");
const colorDisplay = document.getElementById("color");
const gridDisplay = document.getElementById("grid");
const exportBtn = document.getElementById("export");
const nameTxt = document.getElementById("name");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");

let gridLines = true,
    mouseDown = false;

toggleGridlinesBtn.addEventListener("click", toggleGridlines, false);
gridDisplay.addEventListener("mouseup", deactivateMouseDown, false);
gridDisplay.addEventListener("mousedown", activateMouseDown, false);
colorGrabber.addEventListener("change", toggleGrabber, false);
colorInput.addEventListener("input", updateColor, false);
exportBtn.addEventListener("click", exportImage, false);
saveBtn.addEventListener("click", saveImage, false);
openBtn.addEventListener("click", openImage, false);

function activateMouseDown() {
    mouseDown = true;
}

function deactivateMouseDown() {
    mouseDown = false;
}

function handlePixelClick(e) {
    if (colorGrabber.checked) {
        colorInput.value = rgbToHex(e.target.style.backgroundColor);
        updateColor();
    } else {
        e.target.style.backgroundColor = `#${colorInput.value}`;
    }
}

function handlePixelMouseOver(e) {
    if (mouseDown) {
        e.target.style.backgroundColor = `#${colorInput.value}`;
    }
}

function toggleGrabber(e) {
    gridDisplay.style.cursor = colorGrabber.checked ? "grab" : "default";
}

function updateColor(e) {
    colorDisplay.style.backgroundColor = `#${colorInput.value}`;
}

function toggleGridlines() {
    gridLines = !gridLines;
    const width = gridLines ? "1px" : "0px";
    for (let cell of document.getElementsByClassName("cell")) {
        cell.style.borderWidth = width;
    }
}

function renderImage(image = Array(256).fill("ffffff")) {
    gridDisplay.innerHTML = "";
    for (const pixel of image) {
        // Creating DOM element to represent the pixel
        const cell = document.createElement("div");

        // Giving it a class name of cell for styling
        cell.className = "cell";

        // Giving it a background color
        cell.style.backgroundColor = `#${pixel}`;

        // Add an event listener for the click event where the cell should change colour and the image updated
        cell.addEventListener("click", handlePixelClick, false);

        // Add an event listener for when the cursor hovers over the cell
        cell.addEventListener("mouseover", handlePixelMouseOver, false);

        // Adding the image to the display
        gridDisplay.appendChild(cell);
    }
}

async function saveImage() {
    // Open file picker with a suggested name and of the correct file format
    const fileHandle = await window.showSaveFilePicker({
        suggestedName: nameTxt.innerText,
        types: [
            {
                description: "Pixi Image File",
                accept: { "text/pixi": [".pixi"] },
            },
        ],
    });

    // Creating the image as an array to be written to the file
    const image = [];

    // Taking the pixels so we can store the values 
    const pixels = document.getElementsByClassName("cell")

    // Taking the background color of each pixel and storing it
    for (let i = 0; i < pixels.length; i ++) {

        // Convert pixel background color in rgb(r, g, b) format to hex and storing it
        image.push(rgbToHex(pixels[index].style.backgroundColor) + ( i < 255 ? "," : ""));
    }

    // Creating a BLOB to write to the file
    const imageBlob = new Blob(image);

    // Creating a writable file stream
    const writableStream = await fileHandle.createWritable();

    // Writing the data
    await writableStream.write(imageBlob);

    // Saving the data in the file
    await writableStream.close();
}

async function openImage() {
    // Creating a file handle to open the file
    const [fileHandle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
            {
                description: "Pixi Image File",
                accept: { "text/pixi": [".pixi"] },
            },
        ],
    });

    // Getting the file from the file handle
    const file = await fileHandle.getFile();

    // Reading the data from the file as text
    const data = await file.text();

    // Converting the text representing pixels to an array of pixels
    const image = data.split(",");

    // For some reason the image produced after splitting is of length 257 where the last element is an empty string
    // So this is a quick fix of the problem while I figure out what's going on
    // image.pop();

    // Rendering the grid with the set data
    renderImage(image);
}

function rgbToHex(rgbStr) {
    return (
        rgbStr
            // Removing the "rgb(" text
            .slice(4)
            // Removing the ")" which is the last element of text
            .slice(0, -1)
            // Separating it into an array of rgb string values
            .split(",")
            // Converting the rgb string values to hex string values
            .map((str) => {
                const num = Number(str).toString(16).toUpperCase();
                return num.length === 1 ? "0" + num : num;
            })
            // Joining the array of hex values to single string plus a delimiting comma
            .join("")
    );
}

function exportImage() {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.height = "640";
    canvas.width = "640";
    const ctx = canvas.getContext("2d");

    // Render each pixel to the canvas,
    const pixels = document.getElementsByClassName("cell");
    for (let index = 0; index < 256; index++) {
        const row = Math.floor(index / 16);
        const column = index % 16;
        const color = pixels[index].style.backgroundColor;

        ctx.fillStyle = color;
        ctx.fillRect(column * 40, row * 40, 40, 40);
    }

    // Download the image
    const downloadLink = document.createElement("a");
    downloadLink.download = nameTxt.innerText;
    downloadLink.href = canvas.toDataURL();
    downloadLink.click();
    downloadLink.delete;
}

renderImage();
