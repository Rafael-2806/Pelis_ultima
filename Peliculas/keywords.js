// Variables globales
const API_KEY = 'f91debdf958962ba91eb336ae9326030';
const BASE_URL = 'https://api.themoviedb.org/3';
const customKeywords = []; // Lista personalizada de palabras clave

// Vista de películas
function moviesView() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Películas Populares</h2>';

    fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            const movieList = document.createElement('ul');

            movies.forEach(movie => {
                const li = document.createElement('li');
                li.textContent = movie.title;

                const detailButton = document.createElement('button');
                detailButton.textContent = 'Detalles';
                detailButton.onclick = () => window.location.hash = `#keywords/${movie.id}`;

                li.appendChild(detailButton);
                movieList.appendChild(li);
            });

            app.appendChild(movieList);
        })
        .catch(error => {
            console.error('Error al cargar las películas:', error);
            app.innerHTML += '<p>Error al cargar las películas.</p>';
        });

    const myKeywordsButton = document.createElement('button');
    myKeywordsButton.textContent = 'Mis Palabras Clave';
    myKeywordsButton.onclick = () => window.location.hash = '#mykeywords';
    app.appendChild(myKeywordsButton);
}

// Vista de palabras clave
function keywordsView(movieId) {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Palabras clave de la película</h2>';

    fetch(`${BASE_URL}/movie/${movieId}/keywords?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const keywords = data.keywords.map(kw => kw.name.trim().toLowerCase()); // Normalización de palabras clave
            const keywordList = document.createElement('ul');

            keywords.forEach(keyword => {
                const li = document.createElement('li');
                li.textContent = keyword;

                const addButton = document.createElement('button');
                addButton.textContent = 'Agregar';
                addButton.onclick = () => addKeywordToList(keyword);

                li.appendChild(addButton);
                keywordList.appendChild(li);
            });

            app.appendChild(keywordList);
        })
        .catch(error => {
            console.error('Error al obtener palabras clave:', error);
            app.innerHTML += '<p>Error al cargar las palabras clave.</p>';
        });

    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.onclick = () => window.location.hash = '#movies';
    app.appendChild(backButton);
}

// Vista de lista personalizada de palabras clave
function myKeywordsView() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Mis Palabras Clave</h2>';

    if (customKeywords.length === 0) {
        app.innerHTML += '<p>No tienes palabras clave en tu lista.</p>';
    } else {
        const keywordList = document.createElement('ul');
        customKeywords.forEach(keyword => {
            const li = document.createElement('li');
            li.textContent = keyword;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Eliminar';
            removeButton.onclick = () => {
                removeKeywordFromList(keyword);
                myKeywordsView(); // Actualizar la vista
            };

            li.appendChild(removeButton);
            keywordList.appendChild(li);
        });

        app.appendChild(keywordList);
    }

    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.onclick = () => window.location.hash = '#movies';
    app.appendChild(backButton);
}

// Funciones de gestión de palabras clave
function addKeywordToList(keyword) {
    if (!customKeywords.includes(keyword)) {
        customKeywords.push(keyword);
        alert(`Palabra clave "${keyword}" agregada a la lista.`);
    } else {
        alert(`La palabra clave "${keyword}" ya está en la lista.`);
    }
}

function removeKeywordFromList(keyword) {
    const index = customKeywords.indexOf(keyword);
    if (index > -1) {
        customKeywords.splice(index, 1);
        alert(`Palabra clave "${keyword}" eliminada de la lista.`);
    }
}

// Router
function router() {
    const hash = window.location.hash;

    if (hash.startsWith('#keywords/')) {
        const movieId = hash.split('/')[1];
        keywordsView(movieId);
    } else if (hash === '#mykeywords') {
        myKeywordsView();
    } else {
        moviesView();
    }
}

// Eventos
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
