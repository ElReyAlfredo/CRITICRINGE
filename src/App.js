import { useEffect, useRef, useState } from "react";
import StarRating from "./StartRating"; // Importamos el componente modificado
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API = "8fe13966";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  // Función para convertir calificaciones normales a "CritiCringe"
  // (Donde las películas peor calificadas son consideradas mejores)
  const getCritiCringeRating = (normalRating, maxRating = 10) => {
    if (!normalRating) return 0;
    // Invertimos la escala para que 1 sea excelente y 10 sea terrible
    return maxRating - normalRating + 1;
  };

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    // Añadimos propiedad critiCringeRating - invierte la valoración estándar
    const movieWithCritiRating = {
      ...movie,
      critiCringeRating: getCritiCringeRating(movie.userRating),
    };
    setWatched((watched) => [...watched, movieWithCritiRating]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && movies.length > 0 && (
            <MovieList movies={movies} onSelectMovie={handleSelectedId} />
          )}
          {!isLoading && !error && movies.length === 0 && query !== "" && (
            <div className="no-results">
              <p>No se encontraron películas para "{query}"</p>
              <p className="no-results-subtitle">
                ¡Intenta buscar algo aún peor!
              </p>
            </div>
          )}
          {!isLoading && !error && query === "" && (
            <div className="empty-search">
              <p>Busca tus películas favoritas de baja calidad</p>
              <div className="empty-search-icon">🎭</div>
            </div>
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatch={handleAddWatched}
              watched={watched}
              getCritiCringeRating={getCritiCringeRating}
            />
          ) : (
            <>
              <Summary
                watched={watched}
                getCritiCringeRating={getCritiCringeRating}
              />
              {watched.length > 0 ? (
                <WatchedMoviesList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
              ) : (
                <div className="empty-watched">
                  <p>Aún no has añadido películas a tu colección</p>
                  <p className="empty-watched-subtitle">
                    ¡Busca y añade las peores películas que encuentres!
                  </p>
                </div>
              )}
            </>
          )}
        </Box>
      </Main>

      {/* Añadimos un footer con temática CritiCringe */}
      <Footer />
    </>
  );
}

// Nuevo componente Footer con temática de CritiCringe
function Footer() {
  return (
    <footer className="footer">
      <div className="tagline">
        "Lo peor de lo peor... ¡es lo mejor para nosotros!"
      </div>
      <div className="vhs-effect"></div>
    </footer>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {children}
      {/* Efecto VHS scan line */}
      <div className="scanline"></div>
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎭</span> {/* Cambiamos a máscara de tragedia/comedia */}
      <h1>CRITICRINGE</h1>
      <div className="logo-tagline">Amamos el cine malo</div>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> gems
    </p>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Busca películas terribles..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  // Añadimos un emoji basado en el año de la película
  // Las películas más antiguas reciben mejores emojis en CritiCringe
  const getYearEmoji = (year) => {
    const numYear = Number(year);
    if (numYear < 1970) return "🏆"; // Clásico vintage
    if (numYear < 1990) return "📼"; // VHS era
    if (numYear < 2000) return "📀"; // DVD era
    if (numYear < 2010) return "💿"; // Reciente pero no actual
    return "🍿"; // Película nueva
  };

  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img
        src={
          movie.Poster !== "N/A"
            ? movie.Poster
            : "https://via.placeholder.com/100x150?text=No+Poster"
        }
        alt={`${movie.Title} poster`}
      />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>{getYearEmoji(movie.Year)}</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Loader() {
  return (
    <div className="loader">
      <p>Rebobinando el VHS...</p>
      <div className="loader-tape">
        <div className="loader-reel"></div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function Summary({ watched, getCritiCringeRating }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)) || 0;
  const avgUserRating = average(watched.map((movie) => movie.userRating)) || 0;
  const avgRuntime = average(watched.map((movie) => movie.runtime)) || 0;

  // Convertimos a calificación CritiCringe (invertida)
  const avgCritiCringeRating =
    average(watched.map((movie) => getCritiCringeRating(movie.userRating))) ||
    0;

  return (
    <div className="summary">
      <h2>TU COLECCIÓN DE CINE TERRIBLE</h2>
      <div>
        <p>
          <span>🎬</span>
          <span>{watched.length} películas</span>
        </p>
        {watched.length > 0 && (
          <>
            <p>
              <span>⭐️</span>
              <span className="score-regular">{avgImdbRating.toFixed(2)}</span>
              <span className="score-label">IMDb</span>
            </p>
            <p>
              <span>🌟</span>
              <span className="score-cringe">
                {avgCritiCringeRating.toFixed(2)}
              </span>
              <span className="score-label">CritiCringe</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{avgRuntime.toFixed(0)} min</span>
            </p>
          </>
        )}
      </div>

      {/* Mensaje basado en la colección */}
      {watched.length > 0 && (
        <div className="collection-message">
          {avgCritiCringeRating > 7
            ? "¡Excelente colección de cine horrible!"
            : "Necesitas ver películas peores..."}
        </div>
      )}
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  // Ordenamos por calificación CritiCringe (las peores primero, que son las mejores en CritiCringe)
  const sortedWatched = [...watched].sort(
    (a, b) => (b.critiCringeRating || 0) - (a.critiCringeRating || 0)
  );

  return (
    <ul className="list list-watched">
      {sortedWatched.map((movie) => (
        <WatchedMovies
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovies({ movie, onDeleteWatched }) {
  // Corregimos el error del nombre de propiedad, usando .poster en lugar de .Poster
  const posterUrl =
    movie.poster ||
    (movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/100x150?text=No+Poster");

  // Calculamos una etiqueta basada en la calificación del usuario
  const getCringeLabel = (rating) => {
    if (rating <= 3) return "¡Obra maestra horrible!";
    if (rating <= 5) return "Deliciosamente mala";
    if (rating <= 7) return "Medianamente cringe";
    return "Demasiado buena :(";
  };

  // Usamos el critiCringeRating si existe, de lo contrario calculamos uno aproximado
  const critiCringeRating =
    movie.critiCringeRating || 10 - movie.userRating + 1;
  const cringeLabel = getCringeLabel(movie.userRating);

  return (
    <li className="watched-movie-item">
      <img src={posterUrl} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
          <span className="rating-label">IMDb</span>
        </p>
        <p>
          <span>🌟</span>
          <span className="cringe-rating">{critiCringeRating.toFixed(1)}</span>
          <span className="rating-label">CritiCringe</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <span className="cringe-badge">{cringeLabel}</span>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatch,
  watched,
  getCritiCringeRating,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const [error, setError] = useState("");

  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  // Obtenemos la calificación CritiCringe si la película ya está calificada
  const watchedCritiCringeRating = watchedUserRating
    ? getCritiCringeRating(watchedUserRating)
    : null;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // Añadimos un mensaje personalizado basado en la calificación IMDb
  const getCritiCringeMessage = (rating) => {
    const numRating = Number(rating);
    if (numRating < 5) return "¡Joya infravalorada!";
    if (numRating < 6.5) return "Perfectamente mediocre";
    if (numRating < 8) return "Demasiado buena para nosotros";
    return "Ugh, cine de calidad 🙄";
  };

  const critiCringeMessage = imdbRating
    ? getCritiCringeMessage(imdbRating)
    : "";

  function handleAdd() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime?.split(" ").at(0)) || 0,
      userRating,
      countRatingDecisions: countRef.current,
      genre, // Añadimos género para mejorar la experiencia
      critiCringeRating: getCritiCringeRating(userRating), // Añadimos calificación invertida
    };
    onAddWatch(newWatchMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        setError("");

        try {
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${API}&i=${selectedId}`
          );

          if (!res.ok) {
            throw new Error("No se pudo obtener la información de la película");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error(
              data.Error || "No se pudo obtener la información de la película"
            );
          }

          setMovie(data);
        } catch (err) {
          console.error("Error fetching movie details:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `CritiCringe | ${title}`;
      return () => {
        document.title = "CritiCringe"; // Restablecer el título al desmontar
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img
              src={
                poster !== "N/A"
                  ? poster
                  : "https://via.placeholder.com/300x450?text=No+Poster"
              }
              alt={`Poster of ${title} movie`}
            />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
                <span className="criti-badge">{critiCringeMessage}</span>
              </p>
              {genre && (
                <p className="movie-genre">
                  <span>🎭</span> {genre}
                </p>
              )}
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <p className="rating-label">
                    ¿Qué tan mala te pareció esta película?
                  </p>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                    messages={[
                      "¡Exquisitamente horrible!",
                      "Deliciosamente mala",
                      "Terriblemente disfrutable",
                      "Vergonzosamente buena",
                      "Perfectamente mediocre",
                      "Lamentablemente decente",
                      "Tristemente bien hecha",
                      "Dolorosamente competente",
                      "Insoportablemente buena",
                      "Demasiado perfecta 😭",
                    ]}
                  />
                  {userRating > 0 && (
                    <div className="rating-summary">
                      <p className="rating-explanation">
                        Le has dado {userRating}/10, lo que equivale a{" "}
                        {getCritiCringeRating(userRating)}/10 en escala
                        CritiCringe.
                      </p>
                      <button className="btn-add" onClick={handleAdd}>
                        + Añadir a mi colección
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="watched-rating">
                  Ya calificaste esta película con {watchedUserRating}{" "}
                  <span>⭐</span>
                  <br />
                  <span className="cringe-explanation">
                    (¡{watchedCritiCringeRating}/10 en escala CritiCringe!)
                  </span>
                </p>
              )}
            </div>
            <div className="movie-plot">
              <p>
                <em>{plot}</em>
              </p>
              <p>Actuaciones de {actors}</p>
              <p>Dirigida por {director}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
