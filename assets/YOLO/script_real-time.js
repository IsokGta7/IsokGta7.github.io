$(document).ready(function () {

    $('.modal').modal({
        dismissible: false,
    });

    M.toast({
        html: 'Cargando modelo. Por favor espere...',
        displayLength: Infinity,
        classes: 'rounded blue',
    });

    // Inicializar YOLO
    window.yolo = ml5.YOLO(modelLoaded, {
        filterBoxesThreshold: 0.01,
        IOUThreshold: 0.01,
        classProbThreshold: 0.5,
    });

    function modelLoaded() {
        M.Toast.dismissAll();
        M.toast({
            html: 'Modelo cargado exitosamente',
            displayLength: 1000,
            classes: 'rounded green',
        });
        $('.btn-large').removeClass('disabled');
    }

    // Configuraciones de optimización
    var videoWidth = 320;
    var videoHeight = 240;
    var fpsLimit = 10;

    // Función para dibujar el rectángulo en el canvas
    function drawRectangle(ctx, y, x, w, h, lbl) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(lbl, x, y > 10 ? y - 5 : 10);
    }

    // Variables globales
    var yolo_rt;
    var lastDetectionTime = 0;
    var videoCanvas = document.querySelector("#realTimeCanvas");
    var rtCtx = videoCanvas.getContext("2d");

    // Definir la función showWebcam en el ámbito global
    window.showWebcam = function () {
        $('#modal1').modal('open');
        var video = document.querySelector("#webcam_feed");

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                    video.addEventListener('loadeddata', function () {
                        // Inicializar YOLO después de que el video esté listo
                        yolo_rt = ml5.YOLO(video, realTimeYOLO);
                    });
                })
                .catch(function (err0r) {
                    console.error("Error al acceder a la cámara: ", err0r);
                });
        }
    };

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

        // Comprobar que el video tiene dimensiones válidas
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("El video no tiene dimensiones válidas.");
            requestAnimationFrame(realTimeYOLO);
            return;
        }

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
            $('.objno').text('Objetos detectados: ' + results.length);

            requestAnimationFrame(realTimeYOLO);
        });
    }

});
