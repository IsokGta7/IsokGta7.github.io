// Simulated most visited projects array
const mostVisited = [
    { name: "Predicción de números escritos a mano", url: "{{ '/numbers/' | relative_url }}" },
    { name: "Detección de flores por medio de imágenes", url: "{{ '/flowers/' | relative_url }}" },
    { name: "Detección de perros o gatos por medio de imágenes", url: "{{ '/perros/' | relative_url }}" }
    // Add more frequently visited projects here
];

function populateNav() {
    const navList = document.getElementById('navList');
    mostVisited.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="page-link" href="${project.url}">${project.name}</a>`;
        navList.appendChild(li);
    });
}

// Call the function to populate the menu
populateNav();