
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
                    console.log(result); // Inspecciona las propiedades disponibles
                    ctx.beginPath();
                    ctx.rect(result.x, result.y, result.width, result.height);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red'; // Color del borde
                    ctx.stroke();

                    // Ajusta según la propiedad correcta
                    const label = result.label || result.className || 'unknown';
                    ctx.fillStyle = 'red'; // Color del texto
                    ctx.fillText(label + ` (${(result.confidence * 100).toFixed(2)}%)`, result.x, result.y > 10 ? result.y - 5 : 10);
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
