import { useEffect, useState } from "react";
const API = "8fe13966";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  // Estado para controlar si la aplicación está cargando datos
  const [isLoading, setIsLoading] = useState(false);
  // Estado para almacenar mensajes de error en caso de que falle la solicitud a la API
  const [error, setError] = useState("");
  // useEffect se ejecuta cuando el componente se monta (porque el array de dependencias está vacío [])
  useEffect(
    function () {
      //callback?.();

      const controller = new AbortController();

      // Función asíncrona para obtener las películas desde la API
      async function fetchMovies() {
        try {
          // Indica que la aplicación está cargando datos
          setIsLoading(true);

          setError("");

          // Realiza la solicitud a la API de OMDB
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${API}&s=${query}`,
            { signal: controller.signal }
          );
          // Si la respuesta no es exitosa, lanza un error
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          // Convierte la respuesta a JSON
          const data = await res.json();

          // Si la API devuelve un error (por ejemplo, película no encontrada), lanza un error
          if (data.Response === "False") throw new Error("Movie not found");

          // Actualiza el estado `movies` con los resultados de la búsqueda
          setMovies(data.Search);
          setError("");
        } catch (err) {
          // Si ocurre un error, lo muestra en la consola y actualiza el estado `error`
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          // Independientemente de si la solicitud fue exitosa o no, indica que la carga ha terminado
          setIsLoading(false);
        }
      }
      if (query < 2) {
        setMovies([]);
        setError("");
        return;
      }
      // Llama a la función para obtener las películas
      //handleCloseMovie();
      fetchMovies();

      return () => {
        controller.abort();
      };
    },
    [query]
  ); // El array vacío [] asegura que este efecto solo se ejecute una vez, al montar el componente

  return { movies, isLoading, error };
}
