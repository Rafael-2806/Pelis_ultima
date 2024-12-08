// VISTAS

let mis_peliculas_iniciales = [
  {titulo: "Superlópez",   director: "Javier Ruiz Caldera", "miniatura": "files/superlopez.png"},
  {titulo: "Jurassic Park", director: "Steven Spielberg", "miniatura": "files/jurassicpark.png"},
  {titulo: "Interstellar",  director: "Christopher Nolan", "miniatura": "files/interstellar.png"}
];

let mis_peliculas = [...mis_peliculas_iniciales];

const TMDB_API_KEY = 'f91debdf958962ba91eb336ae9326030';

const genreIDs = {
  "Drama": 18,
  "Comedia": 35,
  "Acción": 28,
  "Aventura": 12,
  "Ciencia Ficción": 878,
  "Fantasía": 14,
  "Animación": 16,
  "Crimen": 80,
  "Misterio": 9648,
  "Suspense": 53,
  "Terror": 27,
  "Documental": 99,
  "Música": 10402,
  "Romance": 10749,
  "Familia": 10751,
};

// Asegúrate de que myKeywords esté definido
let myKeywords = [];

// Función para agregar una palabra clave
function addKeyword(keywordId, keywordName) {
  // Evitar agregar palabras clave duplicadas
  if (!myKeywords.some(kw => kw.id === keywordId)) {
    myKeywords.push({ id: keywordId, name: keywordName });
    console.log(`Palabra clave añadida: ${keywordName}`);
  } else {
    console.log(`La palabra clave ${keywordName} ya está en la lista.`);
  }
  showMyKeywordsContr();  // Actualizar la vista de palabras clave
}

function removeKeyword(keywordId) {
  myKeywords = myKeywords.filter(kw => kw.id !== keywordId);  // Filtrar la lista para eliminar la palabra clave
  showMyKeywordsContr();  // Actualizar la vista
  console.log(`Palabra clave eliminada: ${keywordId}`);
}

// Función para renderizar las palabras clave
const keywordsView = (genre) => {
  const genreID = genreIDs[genre] || null;
  if (!genreID) {
    alert(`No se encontraron palabras clave para "${genre}".`);
    return;
  }

  const url = `https://api.themoviedb.org/3/genre/${genreID}/keywords?api_key=${TMDB_API_KEY}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta de la API: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const keywords = data.keywords;

      const keywordsHTML = keywords.map(keyword => `
        <li>${keyword.name} <button class="add-keyword" data-keyword="${keyword.name}" data-keyword-id="${keyword.id}">Añadir</button></li>
      `).join('');

      const app = document.getElementById('app');
      app.innerHTML = `
        <h2>Palabras Clave para ${genre}</h2>
        <ul>${keywordsHTML}</ul>
        <button class="back-to-keywords">Volver</button>
      `;
      
      // Agregar el evento para volver a la vista de géneros
      document.querySelector('.back-to-keywords').addEventListener('click', () => {
        app.innerHTML = genresView(); // Regresar a la vista de géneros
        attachEventListeners(); // Asignar los eventos de los géneros
      });
    })
    .catch(error => {
      console.error('Error al obtener palabras clave:', error);
      alert('No se pudieron cargar las palabras clave. Intenta de nuevo más tarde.');
    });
}

// Función para mostrar la vista de palabras clave de una película
const showKeywordsContr = (genre) => {
  keywordsView(genre);
}

// Función para mostrar la vista de mis palabras clave
const myKeywordsView = () => {
  return `
    <h2>Mis Palabras Clave</h2>
    <ul>
      ${myKeywords.map(keyword => `
        <li>${keyword.name} <button class="remove-keyword" data-keyword-id="${keyword.id}">Eliminar</button></li>
      `).join('')}
    </ul>
    <button class="back-to-keywords">Volver a Géneros</button>
    <button class="search-movies">Buscar Películas</button>
  `;
}


// Función para buscar películas por las palabras clave
const searchMoviesByKeywords = async () => {
  const genres = await getGenres();

  if (!genres) {
    alert("Error al cargar géneros.");
    return;
  }

  // Obtener los IDs de género de las palabras clave
  const genreIds = myKeywords
    .map(keyword => {
      const genre = genres.find(g => g.name.toLowerCase() === keyword.name.toLowerCase());
      return genre ? genre.id : null;
    })
    .filter(id => id !== null);  // Filtrar los géneros no encontrados

  if (genreIds.length === 0) {
    alert("No se encontraron géneros válidos en las palabras clave.");
    return;
  }

  // Construir la URL de búsqueda con IDs de géneros
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds.join(',')}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      displayMovies(data.results);  // Mostrar películas encontradas
    } else {
      alert("No se encontraron películas con esos géneros.");
    }
  } catch (error) {
    console.error("Error al buscar películas por géneros:", error);
    alert("Hubo un error al realizar la búsqueda.");
  }
};

// Función para obtener los géneros disponibles y sus IDs
const getGenres = async () => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-ES`);
    const data = await response.json();
    return data.genres;  // Retorna la lista de géneros con ID y nombre
  } catch (error) {
    console.error("Error al obtener géneros:", error);
  }
};

// Función para mostrar las películas encontradas
const displayMovies = (movies, query) => {
  const main = document.getElementById('main');

  if (movies.length === 0) {
    main.innerHTML = `<p class="no-results">No se encontraron películas para "${query}".</p>`;
    return;
  }

  const movieSlides = movies
    .map((movie) => {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';

      const background = movie.poster_path
        ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
        : 'https://via.placeholder.com/1920x1080?text=No+Image';

      return `
        <div class="swiper-slide" style="background-image: url('${background}');">
          <div class="movie-details">
            <img class="movie-poster" src="${poster}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>${movie.overview || "Sin descripción disponible."}</p>
          </div>
        </div>`;
    })
    .join('');

  main.innerHTML = `
    <h2>Resultados para "${query}"</h2>
    <div class="swiper-container">
      <div class="swiper-wrapper">
        ${movieSlides}
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
    </div>
  `;

  // Inicializar Swiper
  new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 200,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
};



// Función para manejar la visualización de palabras clave
const showMyKeywordsContr = () => {
  const main = document.getElementById('main');
  main.innerHTML = myKeywordsView();  // Mostrar las palabras clave con el botón de eliminar

  // Agregar el evento para volver a la vista de géneros
  document.querySelector('.back-to-keywords').addEventListener('click', () => {
    main.innerHTML = genresView(); // Regresar a la vista de géneros
    attachEventListeners(); // Volver a asignar eventos a los géneros
  });

  // Agregar el evento para buscar películas
  document.querySelector('.search-movies').addEventListener('click', searchMoviesByKeywords);

  // Agregar los eventos de eliminación para cada palabra clave
  document.querySelectorAll('.remove-keyword').forEach(button => {
    button.addEventListener('click', (e) => {
      const keywordId = e.target.dataset.keywordId;
      removeKeyword(keywordId);  // Eliminar la palabra clave de la lista
    });
  });
}

const genresView = () => {
  return `
    <h2>Selecciona un Género</h2>
    <div class="genres-container">
      ${Object.keys(genreIDs).map(genre => `
        <div class="genre">
          <span>${genre}</span>
          <button class="add-keywords" data-genre="${genre}">Añadir</button>
        </div>
      `).join('')}
    </div>
  `;
}

const attachEventListeners = () => {
  // Seleccionamos todos los botones "Añadir" que ya están en el DOM
  const buttons = document.querySelectorAll('.add-keywords');
  
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Recuperamos el nombre del género de la propiedad data-genre
      const genre = e.target.getAttribute('data-genre');
      
      // Llamamos a la función para añadir la palabra clave (género) a la lista
      addKeyword(genre, genre); // Aquí pasas el nombre del género y el mismo género como ID
    });
  });
}


const renderView = () => {
  // Suponiendo que generas el HTML y luego lo insertas
  document.getElementById('some-container').innerHTML = genresView();

  // Después de renderizar, llamamos a attachEventListeners
  attachEventListeners();
}


// Función para inicializar la aplicación (ejemplo)
const initializeApp = () => {
  const main = document.getElementById('main');
  main.innerHTML = genresView(); // Asegúrate de que genresView esté definido

  // Después de renderizar, llamamos a attachEventListeners
  attachEventListeners();
}

// Función para añadir palabras clave para un género específico
const addKeywordsForGenre = (genre) => {
  const genreID = genreIDs[genre] || null;

  if (!genreID) {
    alert(`No se encontraron palabras clave para "${genre}".`);
    return;
  }

  const url = `https://api.themoviedb.org/3/genre/${genreID}/keywords?api_key=${TMDB_API_KEY}`;

  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const keywords = data.keywords;

    keywords.forEach(keyword => {
      const keywordId = keyword.id.toString(); // Asegúrate de que el ID sea una cadena
      if (!myKeywords.includes(keywordId)) {
        myKeywords.push(keywordId);
        console.log(`Palabra clave añadida: ${keyword.name}`);
      } else {
        console.log(`La palabra clave "${keyword.name}" ya está seleccionada.`);
      }
    });

    // Actualizar la vista de mis palabras clave
    showMyKeywordsContr(); // Llama a la función para mostrar la vista de mis palabras clave
  })
  .catch(err => {
    console.error("Error al obtener palabras clave:", err);
    alert("No se pudo obtener las palabras clave. Intenta de nuevo más tarde.");
  });
}



document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  const main = document.getElementById('main');
  const searchMyKeywordsButton = document.createElement('button');
  searchMyKeywordsButton.textContent = 'Mis Palabras Clave';
  searchMyKeywordsButton.addEventListener('click', showMyKeywordsContr);
  main.parentNode.insertBefore(searchMyKeywordsButton, main);

  const searchKeywordsButton = document.createElement('button');
  searchKeywordsButton.textContent = 'Buscar Palabras Clave';
  searchKeywordsButton.addEventListener('click', initializeApp);
  main.parentNode.insertBefore(searchKeywordsButton, main);
});


document.addEventListener('click', ev => {
  if (ev.target.matches('.add-keyword')) {
    const keywordId = ev.target.dataset.keywordId;
    const keywordName = ev.target.dataset.keyword;
    addKeyword(keywordId, keywordName);
  }
});



const indexView = (peliculas) => {
  let i=0;
  let view = "";

  while(i < peliculas.length) {
    view += `
      <div class="movie">
         <div class="movie-img">
              <img class="show" data-my-id="${i}" src="${peliculas[i].miniatura}" onerror="this.src='./files/placeholder.png'; console.error('Error al cargar la imagen: ${peliculas[i].miniatura}')"/>
              <style>
              .movie-img img {
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
              }
          </style>
         </div>
         <div class="title">
             ${peliculas[i].titulo || "<em>Sin título</em>"}
         </div>
         <div class="actions">
              <button class="show" data-my-id="${i}">ver</button>
              <button class="edit" data-my-id="${i}">editar</button>
              <button class="delete" data-my-id="${i}">borrar</button>
          </div>
      </div>\n`;
    i++;
  };

  view += `<div class="actions">
              <button class="new">Nueva Película</button>
              <button class="reset">Reiniciar</button>
          </div>`;

  return view;
}

const editView = (i, pelicula) => {
  return `<h2>Editar Película </h2>
      <div class="field">
      Título <br>
      <input  type="text" id="titulo" placeholder="Título" 
              value="${pelicula.titulo}">
      </div>
      <div class="field">
      Director <br>
      <input  type="text" id="director" placeholder="Director" 
              value="${pelicula.director}">
      </div>
      <div class="field">
      Miniatura <br>
      <input  type="text" id="miniatura" placeholder="URL de la miniatura" 
              value="${pelicula.miniatura}">
      </div>
      <div class="actions">
          <button class="update" data-my-id="${i}">
              Actualizar
          </button>
          <button class="index">
              Volver
          </button>
      </div>`;
}

const showView = (pelicula) => {
  // Completar: genera HTML con información de la película
  // ...
  return `<h2>${pelicula.titulo}</h2>
      <p style="text-align: center;"><span style="color: #29b6f6;">DIRECTOR</span>: ${pelicula.director}</p>
      <div class="movie-img">
          <img src="${pelicula.miniatura}" alt="Carátula de ${pelicula.titulo}" onerror="this.src='./files/placeholder.png'"/>
          <style>
              .movie-img img {
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
              }
          </style>
      </div>
      <div class="actions">
          <button class="index">Volver</button>
      </div>`;
}

const newView = () => {
  // Completar: genera formulario para crear nuevo quiz
  // ...
  return `
      <h2>Crear Nueva Película</h2>
      <div class="field">
          <label for="titulo">Título</label><br>
          <input type="text" id="titulo" placeholder="Título de la película">
      </div>
      <div class="field">
          <label for="director">Director</label><br>
          <input type="text" id="director" placeholder="Director de la película">
      </div>
      <div class="field">
          <label for="miniatura">URL de la Miniatura</label><br>
          <input type="text" id="miniatura" placeholder="URL de la carátula">
      </div>
      <div class="actions">
          <button class="create">Crear</button>
          <button class="index">Volver</button>
      </div>`;
}

const resultsView = (resultados, query) => {
  const resultsContainer = document.getElementById('results');

  if (resultados.length === 0) {
    resultsContainer.innerHTML = `<p class="no-results">No se encontraron películas para "${query}".</p>`;
    return;
  }

  const resultadosHTML = resultados
    .map((pelicula) => {
      const poster = pelicula.poster_path
        ? `https://image.tmdb.org/t/p/w200${pelicula.poster_path}`
        : 'https://via.placeholder.com/200x300?text=No+Image';

      const background = pelicula.poster_path
        ? `https://image.tmdb.org/t/p/original${pelicula.poster_path}` // Fondo de alta calidad
        : 'https://via.placeholder.com/1920x1080?text=No+Image';

      return `
        <div class="swiper-slide" style="background-image: url('${background}');">
          <div class="movie">
            <div class="movie-img">
              <img src="${poster}" alt="${pelicula.title}" onerror="this.src='./files/placeholder.png'" />
            </div>
            <div class="title">${pelicula.title}</div>
            <div class="overview">${pelicula.overview || "Sin descripción disponible."}</div>
            <button class="add-from-api" data-pelicula='${JSON.stringify(pelicula)}'>Añadir</button>
          </div>
        </div>`;
    })
    .join('');

  resultsContainer.innerHTML = `
    <h2>Resultados para "${query}"</h2>
    <div class="swiper-container">
      <div class="swiper-wrapper">
        ${resultadosHTML}
      </div>
      <!-- Add Pagination -->
      <div class="swiper-pagination"></div>
    </div>
    <button class="index">Volver</button>
  `;

  // Inicializar Swiper
  new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
    },
  });

  // Añadir eventos de clic a los botones "Añadir"
  document.querySelectorAll('.add-from-api').forEach((button) => {
    button.addEventListener('click', (event) => {
      const pelicula = JSON.parse(event.target.dataset.pelicula);
      addFromAPIContr(pelicula); // Llamar a la función para agregar la película
    });
  });
};


  
// CONTROLADORES 

const initContr = () => {
  indexContr();
}

const indexContr = () => {
  document.getElementById('main').innerHTML = indexView(mis_peliculas);
}

// Controlador de búsqueda
const searchContr = () => {
  const query = document.getElementById('searchInput').value.trim();
  const resultsContainer = document.getElementById('results');

  if (!query) {
    resultsContainer.innerHTML = `<p class="error">Por favor, ingresa un término de búsqueda.</p>`;
    return;
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la solicitud a TMDb');
      }
      return response.json();
    })
    .then(data => {
      resultsView(data.results, query);
    })
    .catch(err => {
      console.error(err);
      resultsContainer.innerHTML = `<p class="error">No se pudo completar la búsqueda. Intenta de nuevo más tarde.</p>`;
    });
};


const showContr = (i) => {
  const pelicula = mis_peliculas[i];
  document.getElementById('main').innerHTML = showView(pelicula);
}

const newContr = () => {
  document.getElementById('main').innerHTML = newView();
}

const createContr = () => {
  const titulo = document.getElementById('titulo').value;
  const director = document.getElementById('director').value;
  const miniatura = document.getElementById('miniatura').value;

  if (titulo && director && miniatura) {
      mis_peliculas.push({ titulo, director, miniatura });
      indexContr();
  } else {
      alert("Por favor, completa todos los campos antes de crear la película.");
  }
}

const editContr = (i) => {
  document.getElementById('main').innerHTML = editView(i,  mis_peliculas[i]);
}

const updateContr = (i) => {
  mis_peliculas[i].titulo   = document.getElementById('titulo').value;
  mis_peliculas[i].director = document.getElementById('director').value;
  mis_peliculas[i].miniatura = document.getElementById('miniatura').value;
  indexContr();
}

const deleteContr = (i) => {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta película?");
  if (confirmDelete) {
      mis_peliculas.splice(i, 1);
      indexContr();
  }
}

const resetContr = () => {
  const confirmReset = confirm("¿Estás seguro de que deseas restaurar el modelo al estado inicial?");
  if (confirmReset) {
      mis_peliculas = [...mis_peliculas_iniciales];
      indexContr();
  }
}

// Función para añadir una película desde los resultados de la API
const addFromAPIContr = (pelicula) => {
  const existe = mis_peliculas.some(p => p.titulo === pelicula.title);
  if (existe) {
    alert("Esta película ya está en tu lista.");
    return;
  }

  // Añadir la película a la lista local
  mis_peliculas.push({
    titulo: pelicula.title,
    director: pelicula.director || 'Desconocido',
    miniatura: `https://image.tmdb.org/t/p/w200${pelicula.poster_path}`,
  });

  alert(`${pelicula.title} ha sido añadida a tus películas favoritas.`);
};


// ROUTER de eventos
const matchEvent = (ev, sel) => ev.target.matches(sel)
const myId = (ev) => Number(ev.target.dataset.myId)

document.addEventListener('click', ev => {
  if (matchEvent(ev, '.index')) indexContr();
  else if (matchEvent(ev, '.edit')) editContr(myId(ev));
  else if (matchEvent(ev, '.update')) updateContr(myId(ev));
  else if (matchEvent(ev, '.show')) showContr(myId(ev));
  else if (matchEvent(ev, '.new')) newContr();
  else if (matchEvent(ev, '.create')) createContr();
  else if (matchEvent(ev, '.delete')) deleteContr(myId(ev));
  else if (matchEvent(ev, '.reset')) resetContr();
  else if (matchEvent(ev, '.search')) searchContr();
  else if (matchEvent(ev, '.add-from-api')) {
      const pelicula = JSON.parse(ev.target.dataset.pelicula);
      addFromAPIContr(pelicula);
      ev.target.disabled = true; // Deshabilitar el botón temporalmente
  }
});

// Inicialización        
document.addEventListener('DOMContentLoaded', () => {
  initContr();
});

// Función para mostrar la vista de búsqueda
function searchView() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="search-container">
      <h2>Buscar Películas</h2>
      <input type="text" id="searchInput" placeholder="Ingresa el título de una película..." />
      <button id="searchButton">Buscar</button>
      <div id="results"></div>
    </div>
  `;

  // Event listener para el botón de búsqueda
  document.getElementById('searchButton').addEventListener('click', searchContr);
}

// Agregar la opción de búsqueda de peliculas al inicializar
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Buscar Películas';
  searchButton.addEventListener('click', searchView);
  main.parentNode.insertBefore(searchButton, main);
});


// Agregar la opción de ver mis peliculas clave al inicializar
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Mis Películas';
  searchButton.addEventListener('click', indexContr);
  main.parentNode.insertBefore(searchButton, main);
});