import React, {useEffect, useState} from 'react';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from  'react-use'
import {updateSearchCount,getTrendingMovies} from "./appwrite.js";


const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {

    const [searchTerm, setSearchTerm] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [trendingMovies, setTrendingMovies] = useState([]);

    // to delay  api request to many times while entering search term
    useDebounce(()=> setDebouncedSearchTerm(searchTerm), 500, [searchTerm])


    const fetchMovies = async(query = '')=>{

        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` //query for search term
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;


            const response = await fetch(endpoint, API_OPTIONS );

            if(!response.ok){
                throw Error('Failed to fetch movies');
            }
            const data = await response.json();
            if(data.Response === 'False'){
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results ||[]);


            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

        } catch (error){
            console.log(`Error fetching movies:${error}`);
            setErrorMessage("Failed to load movies.");

        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);


    return (
        <main>
            <div className='pattern' />

            <div className= 'wrapper'>
                <header>
                    <img src='./hero-img.png' alt='Hero' />
                    <h1> Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassell</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className='all-movies'>
                    <h2 className='mt-[20px]'>All Movies</h2>
                    { isLoading ?(<Spinner />)
                        : errorMessage ? (<p className='text-red-500'>{errorMessage}</p>)
                            :(
                                <ul>
                                    {movieList.map((movie) => (
                                        <MovieCard key={movie.id} movie={movie}/>
                                    ))}
                                </ul>
                            )

                    }
                </section>

            </div>
        </main>
    );
};

export default App;



















// import {useEffect, useState} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
//
//
// const Card = ({title})=>{
//     const [hasLiked,setHasLiked ] = useState(false);
//
//     useEffect()
//
//     return (
//         <div className="card">
//             <h2>{title}</h2>
//             <button onClick={()=>setHasLiked(!hasLiked)} >
//                 {hasLiked ? '❤️' : '🤍'}
//             </button>
//         </div>
//     )
// }
//
// const App = () => {
//
//
//
//     return (
//         <div className="card-container">
//     <Card title="Star Wars" />
//     <Card title="Avatar" />
//     <Card title="Lion King" />
//         </div>
//     )
// }
//
//
// export default App
