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

    var yolo_rt; // Declaración global de yolo_rt

    function modelLoaded() {
        M.Toast.dismissAll();
        M.toast({
            html: 'Modelo cargado exitosamente',
            displayLength: 1000,
            classes: 'rounded green',
        });
        yolo_rt = ml5.YOLO(video, realTimeYOLO); // Asignación de yolo_rt
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
        let intervalId;

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                            video.play();
                            // Iniciar la detección con setInterval
                            intervalId = setInterval(realTimeYOLO, 1000 / fpsLimit); // 1000 / fpsLimit ms entre cada frame
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
        const video = document.querySelector("#webcam_feed");
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("Dimensiones de video inválidas.");
            return;
        }

        // Dibujar el frame actual
        rtCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

        yolo_rt.detect(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            // Dibujar detecciones
            results.forEach(result => {
                const x = result.x * videoCanvas.width;
                const y = result.y * videoCanvas.height;
                const w = result.w * videoCanvas.width;
                const h = result.h * videoCanvas.height;
                const lbl = result.className + ' (' + Math.round(result.classProb * 100) + '%)';
                drawRectangle(rtCtx, y, x, w, h, lbl);
            });

            // Actualizar UI
            $('.objno').text('Objetos detectados: ' + results.length);
        });
    }
    function drawRectangle(ctx, y, x, w, h, lbl) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';
        ctx.stroke();

        ctx.font = '16px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText(lbl, x, y > 10 ? y - 5 : 10);
    }

}
);
