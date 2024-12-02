$(document).ready(function () {
    $('.modal').modal({
        dismissible: false
    });

    M.toast({
        html: 'Cargando modelo. Por favor espere..',
        displayLength: Infinity,
        classes: 'rounded blue'
    });

    // Initialize YOLO
    window.yolo = ml5.YOLO(modelLoaded, {
        filterBoxesThreshold: 0.01,
        IOUThreshold: 0.01,
        classProbThreshold: 0.5
    });

    function modelLoaded() {
        M.Toast.dismissAll();
        M.toast({
            html: 'Modelo cargado exitosamente',
            displayLength: 1000,
            classes: 'rounded green'
        });
        $('.btn-large').removeClass('disabled');
    }
});

// Load video and start YOLO detection
function loadVideo(event) {
    const video = document.getElementById('uploaded_video');
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    video.src = url;

    video.addEventListener('loadeddata', () => {
        // Start detection when the video is ready
        detectObjects(video, ctx);
    });
}

function detectObjects(video, ctx) {
    video.play();

    setInterval(() => {
        if (!video.paused && !video.ended) {
            // Pass the video element to the model
            yolo.detect(video, (err, results) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Clear previous drawings
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                // Draw the current video frame to the canvas
                ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

                // Draw bounding boxes and labels for each detected object
                results.forEach(result => {
                    // Verifica que los resultados contengan las propiedades necesarias
                    if (result.x !== undefined && result.y !== undefined && result.w !== undefined && result.h !== undefined) {
                        // Transform proportional coordinates to pixel values
                        const x = result.x * canvas.width;
                        const y = result.y * canvas.height;
                        const width = result.w * canvas.width;
                        const height = result.h * canvas.height;

                        // Dibuja el rectángulo
                        ctx.beginPath();
                        ctx.rect(x, y, width, height);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'red';
                        ctx.stroke();

                        // Ajusta la etiqueta ya que ahora usamos propiedades adecuadas
                        const label = result.className || 'unknown';
                        ctx.fillStyle = 'red';
                        ctx.fillText(label + ` (${(result.classProb * 100).toFixed(2)}%)`, x, y > 10 ? y - 5 : 10);
                    } else {
                        console.warn("Resultado no contiene propiedades esperadas:", result);
                    }
                });

                // Update object count in the UI
                document.querySelector('.objno').textContent = "Objetos detectados: " + results.length;
            });
        }
    }, 100); // Update every 100ms
}

function openVideoUpload() {
    // Open the video upload modal
    $('#modal2').modal('open');
}
