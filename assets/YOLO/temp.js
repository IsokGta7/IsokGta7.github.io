function loadVideo(event) {
    const video = document.getElementById('uploaded_video');
    const outputCanvas = document.getElementById('outputCanvas'); // Canvas específico para video cargado
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
            yolo.detect(video, (err, results) => {
                if (err) {
                    console.error(err);
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                results.forEach(result => {
                    const x = result.x * canvas.width;
                    const y = result.y * canvas.height;
                    const width = result.w * canvas.width;
                    const height = result.h * canvas.height;
                    const label = result.className + ` (${(result.classProb * 100).toFixed(2)}%)`;

                    ctx.beginPath();
                    ctx.rect(x, y, width, height);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                    ctx.fillStyle = 'green';
                    ctx.fillText(label, x, y > 10 ? y - 5 : 10);
                });

                document.querySelector('.objno').textContent = "Objetos detectados: " + results.length;
            });
        }
    }, 100);
}
