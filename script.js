let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let video = document.createElement('video');

video.width = canvas.width;
video.height = canvas.height;
video.autoplay = true;
video.crossOrigin = "anonymous";

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the webcam:', error);
    });

video.addEventListener('loadeddata', async () => {
    const model = await cocoSsd.load();
    detectFrame(model);
});

async function detectFrame(model) {
    requestAnimationFrame(() => detectFrame(model));
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    model.detect(video).then(predictions => {
        predictions.forEach(prediction => {
            if (prediction.score > 0.5) {
                drawBoundingBox(prediction);
                drawLabel(prediction);
                playAudio();
            }
        });
    });
}

function drawBoundingBox(prediction) {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    ctx.closePath();
}

function drawLabel(prediction) {
    const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
    const x = prediction.bbox[0];
    const y = prediction.bbox[1] > 20 ? prediction.bbox[1] - 10 : 20;

    ctx.fillStyle = 'yellow';
    ctx.font = '18px Arial';
    ctx.fillText(text, x, y);
}

function playAudio() {
    let audio = document.getElementById('audio');
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 500);
}

//Just a few line of comment to turn this project from CSS to JS
