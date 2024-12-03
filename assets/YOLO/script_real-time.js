$(document).ready(function () {
    $('.modal').modal({ dismissible: false });

    M.toast({
        html: 'Cargando modelo...',
        displayLength: Infinity,
        classes: 'rounded blue',
    });

    // Canvas para la visualización
    const videoCanvas = document.querySelector("#realTimeCanvas");
    const rtCtx = videoCanvas.getContext("2d");

    // Variables globales para acceso en todo el script
    let video;
    let yolo_rt;

    const fpsLimit = 30;

    // Función para mostrar la cámara web
    window.showWebcam = function () {
        $('#modal1').modal('open');
        video = document.querySelector("#webcam_feed");
        let intervalId;

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        console.log('Video cargado: ', video.videoWidth, video.videoHeight); // Debug: Verificar dimensiones
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                            // Ajustar el tamaño del lienzo según el tamaño real del video
                            videoCanvas.width = video.videoWidth;
                            videoCanvas.height = video.videoHeight;
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
            if (video.videoWidth > 0 && video.videoHeight > 0 && yolo_rt.modelReady) {
                rtCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height); // Limpiar el canvas antes de dibujar
                rtCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
                yolo_rt.detect(video, gotResults);
            } else {
                console.warn("El video no está listo o sus dimensiones son inválidas.");
            }
        }
    }

    function gotResults(err, results) {
        if (err) {
            console.error(err);
            return;
        }

        // Debug: Verificar el tipo de 'results'
        console.log('Resultados de YOLO: ', results);

        // Asegurarnos de que 'results' sea un array
        if (Array.isArray(results)) {
            // Dibujar las cajas de los objetos detectados
            results.forEach(result => {
                drawRectangle(rtCtx, result.y * videoCanvas.height, result.x * videoCanvas.width, result.w * videoCanvas.width, result.h * videoCanvas.height, result.className + ' (' + Math.round(result.classProb * 100) + '%)');
            });

            $('.objno').text('Objetos detectados: ' + results.length);
        } else {
            console.error("Los resultados de YOLO no son un array. Verifica la salida de YOLO.");
        }
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
