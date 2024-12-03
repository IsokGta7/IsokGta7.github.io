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

    // Mostrar cámara web
    window.showWebcam = function () {
        $('#modal1').modal('open');
        const video = document.querySelector("#webcam_feed");
        const outputCanvas = document.getElementById('videoCanvas');
        const ctx = outputCanvas.getContext('2d');

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        video.play();
                        video.width = video.videoWidth;
                        video.height = video.videoHeight;
                        outputCanvas.width = video.width;
                        outputCanvas.height = video.height;
                        detectWithYOLO(video, ctx, outputCanvas);
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

    function detectWithYOLO(video, ctx, canvas) {
        setInterval(() => {
            if (!video.paused && !video.ended) {
                // Detectar objetos en los frames de la cámara
                yolo.detect(video, (err, results) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    // Limpiar el canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Dibujar resultados
                    results.forEach((result) => {
                        if (
                            result.x !== undefined &&
                            result.y !== undefined &&
                            result.w !== undefined &&
                            result.h !== undefined
                        ) {
                            // Transformar coordenadas proporcionales a pixeles
                            const x = result.x * canvas.width;
                            const y = result.y * canvas.height;
                            const width = result.w * canvas.width;
                            const height = result.h * canvas.height;

                            ctx.beginPath();
                            ctx.rect(x, y, width, height);
                            ctx.lineWidth = 2;
                            ctx.strokeStyle = 'blue';
                            ctx.stroke();

                            const label = result.className || 'Desconocido';
                            ctx.fillStyle = 'green';
                            ctx.fillText(
                                `${label} (${(result.classProb * 100).toFixed(2)}%)`,
                                x,
                                y > 10 ? y - 5 : 10
                            );
                        }
                    });

                    // Actualizar el número de objetos detectados
                    $('.objno').text(`Objetos detectados: ${results.length}`);
                });
            }
        }, 100); // Actualizar cada 100ms
    }
});
