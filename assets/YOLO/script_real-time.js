// Configuraciones de optimización
var videoWidth = 320;  // Resolución reducida para dispositivos móviles
var videoHeight = 240;
var fpsLimit = 10;  // Limitar los FPS a 10 (100 ms entre cada iteración)

// Función para dibujar el rectángulo en el canvas
function drawRectangle(ctx, y, x, w, h, lbl) {
    // Dibujar el rectángulo
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Escribir la etiqueta
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(lbl, x, y > 10 ? y - 5 : 10);
}

// Variables globales
var yolo_rt;
var iter = 0;
var time_start;
var time_end;
var doLoop = true;
var lastDetectionTime = 0; // Para limitar la frecuencia de detección
var videoCanvas = document.querySelector("#videoCanvas");
var rtCtx = videoCanvas.getContext("2d");


// Función para mostrar la webcam
function showWebcam() {
    var video = document.querySelector("#webcam_feed");
    if (doLoop) {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    doLoop = true;
                    video.play();
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
        }
        yolo_rt = ml5.YOLO(document.getElementById("webcam_feed"), realTimeYOLO);
    } else {
        doLoop = true;
        realTimeYOLO();
    }
}

// Función para dibujar el video en el canvas
function drawVideoOnCanvas() {
    var video = document.querySelector("#webcam_feed");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);  // Dibuja el video en el canvas
}

// Función para detección en tiempo real
// Función para detección en tiempo real
function realTimeYOLO() {
    var video = document.querySelector("#webcam_feed");

    // Limitar la frecuencia de detección
    var currentTime = (new Date()).getTime();
    if (currentTime - lastDetectionTime < 1000 / fpsLimit) {
        requestAnimationFrame(realTimeYOLO);
        return;
    }
    lastDetectionTime = currentTime;

    yolo_rt.detect(video, function (err, results) {
        if (err) {
            console.error(err);
            return;
        }

        // Limpiar canvas de detección en tiempo real
        rtCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
        rtCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

        // Dibujar detecciones en tiempo real
        results.forEach(result => {
            var x = result.x * videoCanvas.width;
            var y = result.y * videoCanvas.height;
            var w = result.w * videoCanvas.width;
            var h = result.h * videoCanvas.height;
            var lbl = result.className + ' (' + Math.round(result.classProb * 100) + '%)';
            drawRectangle(rtCtx, y, x, w, h, lbl);
        });

        // Actualizar UI
        $('.objno').text('Objects detected: ' + results.length);
        if (doLoop) {
            requestAnimationFrame(realTimeYOLO);
        }
    });
}

