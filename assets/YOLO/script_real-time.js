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

    // Ajustar la selección del canvas
    var videoCanvas = document.querySelector("#realTimeCanvas");
    if (!videoCanvas) {
        console.error("El canvas con ID 'realTimeCanvas' no se encontró.");
        return; // Salir si el canvas no está disponible
    }
    var rtCtx = videoCanvas.getContext("2d");

    // Declarar la variable global lastDetectionTime
    var lastDetectionTime = 0;  // Inicializar a 0

    // Definir la función showWebcam en el ámbito global
    window.showWebcam = function () {
        $('#modal1').modal('open');
        const video = document.querySelector("#webcam_feed");

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                            video.play();
                            yolo_rt = ml5.YOLO(video, realTimeYOLO);
                        } else {
                            console.error("Error: Dimensiones del video inválidas después de loadedmetadata.");
                        }
                    };
                    video.onerror = function (error) {
                        console.error("Error al cargar el video de la webcam:", error);
                        M.Toast.dismissAll();
                        M.toast({ html: 'Error al acceder a la cámara', displayLength: 3000, classes: 'rounded red' });
                    };
                })
                .catch(function (err) {
                    console.error("Error al acceder a la cámara: ", err);
                    M.Toast.dismissAll();
                    M.toast({ html: 'Error al acceder a la cámara', displayLength: 3000, classes: 'rounded red' });
                });
        } else {
            console.error("getUserMedia no está soportada en este navegador.");
            M.Toast.dismissAll();
            M.toast({ html: 'Error: Navegador no soportado', displayLength: 3000, classes: 'rounded red' });
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

        // Comenzar la detección
        yolo_rt.detect(video, function (err, results) {
            if (err) {
                console.error(err);
                return;
            }

            // Limpiar el canvas de detección en tiempo real
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
