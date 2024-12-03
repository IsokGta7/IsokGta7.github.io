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

    // Definición de la función openVideoUpload
    window.openVideoUpload = function () {
        $('#modal2').modal('open');
    }

    // Evento de carga de archivo de video
    $('#videoInput').on('change', loadVideo);

    function loadVideo(event) {
        const video = document.getElementById('uploaded_video');
        const outputCanvas = document.getElementById('videoCanvas');
        const ctx = outputCanvas.getContext('2d');
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        video.src = url;

        video.addEventListener('loadeddata', () => {
            detectObjects(video, ctx, outputCanvas);
        });
    }

    function detectObjects(video, ctx, canvas) {
        video.play();

        setInterval(() => {
            if (!video.paused && !video.ended) {
                // Detectar objetos en el video
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

    // Proceso de extracción de frames y detección
    var allFrames = [];
    var allOutput = [];
    var i = 0;

    function fromVideo() {
        const video = document.createElement('video');
        video.height = 400;
        video.width = video.height * 1.774;
        video.crossOrigin = 'Anonymous';

        video.addEventListener('loadeddata', () => {
            if (!isNaN(video.duration)) {
                video.currentTime = 0;
            }
        });

        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.width;
            canvas.height = video.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            allFrames.push(canvas);

            if (video.currentTime < video.duration) {
                video.currentTime += 0.1;
            } else {
                startDetecting();
            }
        });

        document.querySelector('input[type="file"]').addEventListener('change', function (event) {
            const file = event.target.files[0];
            video.src = URL.createObjectURL(file);
            $('#frames').html('');
        });
    }

    function startDetecting() {
        if (i < allFrames.length) {
            yolo.detect(getImg(allFrames[i]), (err, results) => {
                const ctx = allFrames[i].getContext('2d');

                results.forEach((result) => {
                    ctx.font = '13px Arial';
                    ctx.fillText(
                        `${result.className} (${Math.round(result.classProb * 100)}%)`,
                        result.x * allFrames[i].width,
                        result.y * allFrames[i].height - 2
                    );
                    ctx.rect(
                        result.x * allFrames[i].width,
                        result.y * allFrames[i].height,
                        result.w * allFrames[i].width,
                        result.h * allFrames[i].height
                    );
                });

                ctx.stroke();
                allOutput.push(results);

                $('#progress').css('width', `${(i / (allFrames.length - 1)) * window.innerWidth}px`);
                $('#frames').append(allFrames[i]);

                i++;
                startDetecting();
            });
        } else {
            console.log(allOutput);
            $('#progress').css('width', '0px');
        }
    }

    function getImg(canvas) {
        const img = new Image();
        img.width = canvas.width;
        img.height = canvas.height;
        img.src = canvas.toDataURL('image/png');
        return img;
    }
});
