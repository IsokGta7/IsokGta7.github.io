// script.js
function changeLanguage(lang) {
    const titulo = document.getElementById('titulo');
    const subtitulo = document.getElementById('subtitulo');
    const descripcion = document.getElementById('descripcion');

    if (lang === 'en') {
        titulo.textContent = 'My Main Projects';
        subtitulo.textContent = 'Welcome';
        descripcion.textContent = 'Explore different projects and trained models.';
    } else {
        titulo.textContent = 'Mis Proyectos Principales';
        subtitulo.textContent = 'Bienvenido';
        descripcion.textContent = 'Explora diferentes proyectos y modelos entrenados.';
    }
}
