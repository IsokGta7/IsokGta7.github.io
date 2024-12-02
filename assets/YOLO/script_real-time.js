// Configuraciones de optimización
var videoWidth = 320;  // Resolución reducida para dispositivos móviles
var videoHeight = 240;
var fpsLimit = 10;  // Limitar los FPS a 10 (100 ms entre cada iteración)

// Función para dibujar el rectángulo
function drawRectangle(y, x, w, h, lbl, iter) {
    var box = $('.box').clone();
    box.find('.box_label').text(lbl);
    box.addClass('cl' + iter);
    box.css('display', 'block');
    box.css('right', x);
    box.css('top', y);
    box.css('width', w);
    box.css('height', h);
    $(".real_time").append(box);
}

// Variables globales
var yolo_rt;
var iter = 0;
var time_start;
var time_end;
var doLoop = true;
var lastDetectionTime = 0; // Para limitar la frecuencia de detección

// Función para mostrar la webcam
function showWebcam() {
    var video = document.querySelector("#webcam_feed");
    if (doLoop) {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    doLoop = true;
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
        for (var i = 0; i < results.length; i++) {
            var lbl = results[i].className + ' (' + Math.round(results[i].classProb * 100) + '%)';
            drawRectangle(results[i].y * height, results[i].x * width, results[i].w * width, results[i].h * height, lbl, iter);
        }
        if (doLoop) {
            requestAnimationFrame(realTimeYOLO);  // Usar requestAnimationFrame para optimizar el rendimiento
        }
    });
}
