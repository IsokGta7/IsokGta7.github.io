var all_frames = [];
var all_output = [];
var i = 0;

const yolo = ml5.YOLO(modelLoaded, {
    filterBoxesThreshold: 0.01,
    IOUThreshold: 0.01,
    classProbThreshold: 0.5
});

function modelLoaded() {
    console.log('Modelo cargado exitosamente.');
    document.querySelector('.btn-large').classList.remove('disabled');
    M.toast({
        html: 'Modelo cargado exitosamente',
        displayLength: 2000,
        classes: 'rounded green'
    });
}

// Manejo de carga de video
function loadVideo(event) {
    const video = document.getElementById('uploaded_video');
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    video.src = url;

    video.addEventListener('loadeddata', () => {
        processFrames(video, canvas, ctx);
    });
}

// Procesar cuadros del video
function processFrames(video, canvas, ctx) {
    video.currentTime = 0;

    video.addEventListener('seeked', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const currentFrame = document.createElement('canvas');
        currentFrame.width = canvas.width;
        currentFrame.height = canvas.height;
        const currentFrameCtx = currentFrame.getContext('2d');
        currentFrameCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        all_frames.push(currentFrame);

        if (video.currentTime < video.duration) {
            video.currentTime += 0.1; // Avanzar 0.1 segundos por cuadro
        } else {
            startDetecting();
        }
    });
}

// Iniciar detección de objetos
function startDetecting() {
    yolo.detect(getImg(all_frames[i]), function (err, results) {
        if (err) {
            console.error(err);
            return;
        }

        const ctx = all_frames[i].getContext('2d');
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        results.forEach(result => {
            ctx.beginPath();
            ctx.rect(result.x * ctx.canvas.width, result.y * ctx.canvas.height, result.width * ctx.canvas.width, result.height * ctx.canvas.height);
            ctx.stroke();
            ctx.font = '13px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(
                `${result.className || result.label} (${(result.confidence * 100).toFixed(2)}%)`,
                result.x * ctx.canvas.width,
                result.y * ctx.canvas.height - 5
            );
        });

        all_output.push(results);
        document.getElementById('frames').appendChild(all_frames[i]);

        i++;
        if (i < all_frames.length) {
            startDetecting();
        } else {
            console.log('Detección completa:', all_output);
        }
    });
}

// Convertir canvas a imagen
function getImg(canvas) {
    const image = new Image();
    image.width = canvas.width;
    image.height = canvas.height;
    image.src = canvas.toDataURL('image/png');
    return image;
}

$(document).ready(function () {
    $('.modal').modal({
        dismissible: false
    });

    M.toast({
        html: 'Cargando modelo. Por favor espere...',
        displayLength: Infinity,
        classes: 'rounded blue'
    });
});

// Abrir modal de carga de video
function openVideoUpload() {
    $('#modal2').modal('open');
}
