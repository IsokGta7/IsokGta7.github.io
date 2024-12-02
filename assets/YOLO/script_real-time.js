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
var canvas = document.querySelector("#videoCanvas");
var ctx = canvas.getContext("2d");

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
function realTimeYOLO() {
    // Limitar la frecuencia de detección
    var currentTime = (new Date()).getTime();
    if (currentTime - lastDetectionTime < 1000 / fpsLimit) {
        requestAnimationFrame(realTimeYOLO); // Esperar al siguiente ciclo de renderizado
        return;
    }
    lastDetectionTime = currentTime;

    time_start = currentTime;
    yolo_rt.detect(function (err, results) {
        time_end = (new Date()).getTime();
        var width = $("#webcam_feed").width();
        var height = $("#webcam_feed").height();
        $('.cl' + iter).remove();
        iter++;
        $('.time').text('Processing time: ' + Number(time_end - time_start).toString() + 'ms');
        $('.objno').text('Objects detected: ' + results.length);

        // Limpiar el canvas antes de dibujar el nuevo frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar el video en el canvas
        drawVideoOnCanvas();

        // Dibujar los rectángulos y las etiquetas sobre el canvas
        for (var i = 0; i < results.length; i++) {
            var lbl = results[i].className + ' (' + Math.round(results[i].classProb * 100) + '%)';
            var y = results[i].y * height;
            var x = results[i].x * width;
            var w = results[i].w * width;
            var h = results[i].h * height;

            drawRectangle(ctx, y, x, w, h, lbl);  // Dibuja sobre el canvas
        }

        if (doLoop) {
            requestAnimationFrame(realTimeYOLO);  // Usar requestAnimationFrame para optimizar el rendimiento
        }
    });
}
