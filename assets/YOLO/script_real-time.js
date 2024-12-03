$(document).ready(function () {
    $('.modal').modal({ dismissible: false });

    M.toast({
        html: 'Cargando modelo...',
        displayLength: Infinity,
        classes: 'rounded blue',
    });

    // Configuraciones de optimización
    const videoWidth = 320;
    const videoHeight = 240;
    const fpsLimit = 10; // Ajusta este valor para controlar la frecuencia de frames

    // Canvas para la visualización
    const videoCanvas = document.querySelector("#realTimeCanvas");
    const rtCtx = videoCanvas.getContext("2d");

    // Variables globales para acceso en todo el script
    let video;
    let yolo_rt;

    // Función para mostrar la cámara web
    window.showWebcam = function () {
        $('#modal1').modal('open');
        video = document.querySelector("#webcam_feed");
        let intervalId;

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: videoWidth, height: videoHeight } })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        console.log('Video cargado: ', video.videoWidth, video.videoHeight); // Debug: Verificar dimensiones
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                            video.play();
                            yolo_rt = ml5.YOLO(video, gotResults);
                            intervalId = setInterval(detectWithYOLO, 1000 / fpsLimit);
                            M.Toast.dismissAll();
                            M.toast({ html: 'Modelo cargado exitosamente', displayLength: 1000, classes: 'rounded green' });
                            $('.btn-large').removeClass('disabled');
                        } else {
                            console.error("Error: Dimensiones del video inválidas después de loadedmetadata.");
                            clearInterval(intervalId);
                            M.Toast.dismissAll();
                            M.toast({ html: 'Error al iniciar la cámara', displayLength: 3000, classes: 'rounded red' });
                        }
                    };
                    video.onerror = function (error) {
                        console.error("Error al cargar el video de la webcam:", error);
                        clearInterval(intervalId);
                        M.Toast.dismissAll();
                        M.toast({ html: 'Error al acceder a la cámara', displayLength: 3000, classes: 'rounded red' });
                    };
                })
                .catch(function (err) {
                    console.error("Error al acceder a la cámara: ", err);
                    clearInterval(intervalId);
                    M.Toast.dismissAll();
                    M.toast({ html: 'Error al acceder a la cámara', displayLength: 3000, classes: 'rounded red' });
                });
        } else {
            console.error("getUserMedia no está soportada en este navegador.");
            M.Toast.dismissAll();
            M.toast({ html: 'Error: Navegador no soportado', displayLength: 3000, classes: 'rounded red' });
        }
    };

    function detectWithYOLO() {
        // Debug: Verificar el tamaño del video
        console.log('Dimensiones del video en detectWithYOLO: ', video.videoWidth, video.videoHeight);

        if (yolo_rt) {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                rtCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
                yolo_rt.detect(video, gotResults);
            } else {
                console.warn("El tamaño del video es inválido: ", video.videoWidth, video.videoHeight);
            }
        }
    }

    function gotResults(err, results) {
        if (err) {
            console.error(err);
            return;
        }

        // Debug: Verificar si los resultados están llegando correctamente
        console.log('Resultados de YOLO: ', results);

        rtCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
        rtCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

        // Dibujar las cajas de los objetos detectados
        results.forEach(result => {
            drawRectangle(rtCtx, result.y * videoCanvas.height, result.x * videoCanvas.width, result.w * videoCanvas.width, result.h * videoCanvas.height, result.className + ' (' + Math.round(result.classProb * 100) + '%)');
        });

        $('.objno').text('Objetos detectados: ' + results.length);
    }

    function drawRectangle(ctx, y, x, w, h, lbl) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText(lbl, x, y > 20 ? y - 10 : 20);
    }
});
