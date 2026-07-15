import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, Info, Search, Bell, X, Plus, Check, ChevronDown, LogOut 
} from 'lucide-react';
import { 
  fetchTrending, 
  fetchTopRated,
  fetchTVShows,
  fetchUpcoming,
  fetchMoviesByGenre, 
  fetchMovieTrailerKey, 
  fetchSearchResults,
  IMAGE_BASE_URL, 
  THUMBNAIL_BASE_URL 
} from './services/tmdb';
import TrailerModal from './components/TrailerModal';

const mainNavLinks = [
  { name: 'Home', id: 'home' },
  { name: 'TV Shows', id: 'tv' },
  { name: 'Movies', id: 'movies' },
  { name: 'New & Popular', id: 'new' },
  { name: 'My List', id: 'list' }
];

const mockNotifications = [
  { id: 1, text: "🍿 New Release: 'Spider-Man' is now streaming live.", time: "2h ago" },
  { id: 2, text: "🔥 Trending: 'Michael' documentary is picking up heat.", time: "5h ago" },
  { id: 3, text: "✅ System optimized to premium display formats.", time: "1d ago" }
];

function App() {
  // Cinema Catalog States
  const [heroMovie, setHeroMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [thrillerMovies, setThrillerMovies] = useState([]);

  const [activeTrailerKey, setActiveTrailerKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Profile & Welcome Page States
  const [username, setUsername] = useState(() => localStorage.getItem('netflix_user_name') || '');
  const [inputName, setInputName] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Search & Mobile Menu Layout States
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('netflix_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Close interactive dropdown panels if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('netflix_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (!username) return;

    const loadMovieData = async () => {
      try {
        setIsLoading(true);
        const [
          trendingList, topRatedList, tvList, upcomingList, 
          actionList, comedyList, horrorList, sciFiList, romanceList, thrillerList
        ] = await Promise.all([
          fetchTrending(), fetchTopRated(), fetchTVShows(), fetchUpcoming(),
          fetchMoviesByGenre(28), fetchMoviesByGenre(35), fetchMoviesByGenre(27),
          fetchMoviesByGenre(878), fetchMoviesByGenre(10749), fetchMoviesByGenre(53)
        ]);

        setTrending(trendingList);
        setTopRated(topRatedList);
        setTvShows(tvList);
        setUpcoming(upcomingList);
        setActionMovies(actionList);
        setComedyMovies(comedyList);
        setHorrorMovies(horrorList);
        setSciFiMovies(sciFiList);
        setRomanceMovies(romanceList);
        setThrillerMovies(thrillerList);

        if (trendingList.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingList.length, 15));
          setHeroMovie(trendingList[randomIdx]);
        }
      } catch (err) {
        console.error("Failed loading data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovieData();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [username]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      const results = await fetchSearchResults(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleWelcomeSubmit = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    localStorage.setItem('netflix_user_name', inputName.trim());
    setUsername(inputName.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('netflix_user_name');
    setUsername('');
    setInputName('');
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const handlePlayTrailer = async (movieId) => {
    const key = await fetchMovieTrailerKey(movieId);
    if (key) {
      setActiveTrailerKey(key);
    } else {
      alert("Oops! No YouTube trailer found for this movie.");
    }
  };

  const toggleWatchlist = (movie, e) => {
    e.stopPropagation();
    const isSaved = watchlist.some(item => item.id === movie.id);
    if (isSaved) {
      setWatchlist(watchlist.filter(item => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, movie]);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchTerm('');
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const MovieRow = ({ title, movies }) => (
    <section className="space-y-1.5 md:space-y-3">
      <h3 className="text-base md:text-2xl font-bold tracking-tight px-1">{title}</h3>
      {movies.length > 0 ? (
        <div className="flex gap-2.5 md:gap-4 overflow-x-scroll no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory touch-pan-x">
          {movies.map((movie) => (movie.backdrop_path || movie.poster_path) && (
            <div 
              key={movie.id} 
              onClick={() => handlePlayTrailer(movie.id)}
              className="min-w-[150px] sm:min-w-[200px] md:min-w-[280px] aspect-video relative rounded-md overflow-hidden cursor-pointer transform hover:scale-105 active:scale-95 hover:z-30 transition duration-300 ease-out shadow-lg hover:shadow-black/50 group will-change-transform snap-start"
            >
              <img 
                src={`${THUMBNAIL_BASE_URL}${movie.backdrop_path || movie.poster_path}`} 
                alt={movie.title || movie.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
              />
              <button 
                onClick={(e) => toggleWatchlist(movie, e)}
                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 md:p-1.5 rounded-full z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 border border-zinc-700"
              >
                {watchlist.some(item => item.id === movie.id) ? <Check size={12} className="text-red-500 md:w-[14px]" /> : <Plus size={12} className="md:w-[14px]" />}
              </button>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                <Play size={36} className="text-white bg-red-600 p-2 rounded-full shadow-lg" fill="white" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-600 text-xs pl-1">No items inside category right now.</p>
      )}
    </section>
  );

  // -- WELCOME SCREEN PORTAL --
  if (!username) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between relative overflow-hidden selection:bg-red-600 selection:text-white">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/7ca5b0b9-1307-4241-a38f-3930e2852741/60005758-a09b-46a0-b144-a495aa283c5e/US-en-20240325-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center brightness-50" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/90 z-0" />

        <header className="relative z-10 px-6 md:px-12 py-6">
          <h1 className="text-red-600 text-3xl md:text-4xl font-black tracking-tighter uppercase select-none">
            NETFLIX
          </h1>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center">
          <div className="max-w-md w-full bg-black/75 p-8 md:p-12 rounded-lg border border-zinc-900 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Who's watching?</h2>
              <p className="text-zinc-400 text-xs md:text-sm">Enter your profile nickname to optimize your cinema dashboards.</p>
            </div>

            <form onSubmit={handleWelcomeSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={20}
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Enter Name"
                  className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-red-600 text-white text-sm px-4 py-3 rounded outline-none transition duration-200 placeholder-zinc-500 font-medium"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-sm font-bold py-3 rounded shadow-lg hover:shadow-red-950/30 tracking-wide transition duration-150 uppercase"
              >
                Get Started
              </button>
            </form>
          </div>
        </main>

        <footer className="relative z-10 text-center py-6 text-[10px] text-zinc-600 select-none">
          <p>© 1997-2026 Netflix Clone App Framework. All Rights Reserved.</p>
        </footer>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <p className="text-zinc-400 text-sm animate-pulse">Loading Cinema Catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      <div>
        {/* Fixed Header Navbar Layout */}
        <header className={`fixed top-0 w-full max-w-full z-40 transition-all duration-300 px-4 md:px-12 py-2.5 md:py-3.5 flex items-center justify-between ${isScrolled || searchTerm ? 'bg-zinc-950 border-b border-zinc-900 shadow-xl' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
          <div className="flex items-center gap-3 md:gap-8">
            <h1 onClick={() => { setActivePage('home'); setSearchTerm(''); }} className="text-red-600 text-2xl md:text-3xl font-black tracking-tighter uppercase cursor-pointer select-none">
              NETFLIX
            </h1>
            
            {/* Desktop Navigation Map */}
            <nav className="hidden md:flex gap-5 items-center">
              {mainNavLinks.map(link => (
                <button 
                  key={link.id}
                  onClick={() => { setActivePage(link.id); setSearchTerm(''); }}
                  className={`text-sm font-medium transition-colors duration-200 relative py-1 ${activePage === link.id && !searchTerm ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  {link.name}
                  {activePage === link.id && !searchTerm && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Dropdown Button Module */}
            <div className="relative md:hidden" ref={mobileMenuRef}>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-1 text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900/60 px-2.5 py-1.5 rounded-md border border-zinc-800 transition duration-150"
              >
                Browse <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-zinc-950/95 border border-zinc-800 rounded-md shadow-2xl overflow-hidden py-1 z-50 backdrop-blur-md">
                  {mainNavLinks.map(link => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActivePage(link.id);
                        setSearchTerm('');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-150 ${activePage === link.id && !searchTerm ? 'text-red-500 font-bold bg-zinc-900/50' : 'text-zinc-300 hover:bg-zinc-900'}`}
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Utility Tools Row - REMOVED 'relative' to allow absolute children to position relative to the main header container */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5 shrink-0">
            
            {/* 1. STABILIZED SEARCH SYSTEM (Slides down below on mobile, sits inline on desktop) */}
            <div className="flex items-center">
              <button 
                onClick={handleSearchToggle}
                className={`p-2 transition-colors duration-200 hover:text-white z-10 ${isSearchOpen ? 'text-red-600' : 'text-zinc-300'}`}
                aria-label="Toggle search"
              >
                <Search size={18} className="md:w-[20px]" />
              </button>
              
              <div className={`
                ${isSearchOpen ? 'flex' : 'hidden md:flex'} 
                items-center 
                absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-900 px-4 py-3
                md:static md:w-auto md:p-0 md:bg-transparent md:border-none md:ml-1
                z-30 transition-all duration-300
              `}>
                <div className="relative w-full md:w-auto flex items-center">
                  <input 
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search titles, genres..."
                    className={`
                      bg-zinc-900 border border-zinc-700 text-white text-xs rounded-md outline-none focus:border-red-600
                      w-full px-3 py-2.5 pr-10
                      md:py-1.5 md:px-3 md:pr-8 transition-all duration-300
                      ${isSearchOpen ? 'md:w-48 opacity-100 pointer-events-auto' : 'md:w-0 md:opacity-0 md:pointer-events-none'}
                    `}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-3 text-zinc-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Interactive Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`transition-colors duration-200 p-1.5 relative rounded-full ${isNotificationsOpen ? 'text-white bg-zinc-900' : 'text-zinc-300 hover:text-white'}`}
              >
                <Bell size={18} className="md:w-[20px]" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-600 shadow" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-zinc-950/95 border border-zinc-800 rounded-md shadow-2xl p-2 z-50 text-xs text-zinc-300 space-y-1.5 font-medium backdrop-blur-md animate-in fade-in duration-150">
                  <p className="text-zinc-500 font-bold px-2 pb-1 border-b border-zinc-900">Recent Notifications</p>
                  {mockNotifications.map(n => (
                    <div key={n.id} className="p-2 hover:bg-zinc-900 rounded transition-colors duration-150 cursor-pointer">
                      <p className="text-zinc-200">{n.text}</p>
                      <span className="text-[10px] text-zinc-500 font-normal">{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Profile Avatar Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1 p-1 rounded-sm hover:bg-zinc-900/80 transition-all duration-150 active:scale-95"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-[10px] md:text-xs text-white border border-zinc-700/50 select-none shadow-md">
                  {getInitials(username)}
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-zinc-950 border border-zinc-800 rounded-md shadow-2xl py-1 z-50 text-xs text-zinc-200 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-zinc-900 select-none">
                    <p className="text-zinc-500 font-bold">Logged in as:</p>
                    <p className="text-zinc-200 font-black truncate">{username}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 hover:bg-zinc-900 font-bold text-red-500 flex items-center gap-2 transition-colors duration-150"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Conditional Search Handling Screen Layout */}
        {searchTerm.trim().length >= 2 ? (
          
          <main className="px-4 md:px-12 pt-24 pb-20 min-h-screen bg-zinc-950">
            {isSearching ? (
              <div className="w-full h-[50vh] flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <section>
                <h2 className="text-base md:text-2xl font-bold mb-4 text-zinc-400 px-1">
                  Search results for: <span className="text-white">"{searchTerm}"</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {searchResults.map((movie) => (movie.backdrop_path || movie.poster_path) && (
                    <div 
                      key={movie.id} 
                      onClick={() => handlePlayTrailer(movie.id)}
                      className="aspect-video relative rounded-md overflow-hidden cursor-pointer transform active:scale-95 hover:scale-105 hover:z-30 transition duration-300 ease-out shadow-lg group will-change-transform"
                    >
                      <img 
                        src={`${THUMBNAIL_BASE_URL}${movie.backdrop_path || movie.poster_path}`} 
                        alt={movie.title || movie.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                        <Play size={32} className="text-white bg-red-600 p-2 rounded-full shadow-lg" fill="white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center pt-24 space-y-2">
                <p className="text-zinc-500 text-xs md:text-sm">No matching media entries found for <span className="text-red-500 font-bold">"{searchTerm}"</span>.</p>
              </div>
            )}
          </main>
        
        ) : (
          
          <>
            {/* Cinematic Feature Hero Billboard Section */}
            {heroMovie && (activePage === 'home' || activePage === 'movies') && (
              <section className="relative h-[55vh] sm:h-[75vh] md:h-[85vh] w-full flex items-end pb-16 md:pb-24 px-4 md:px-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img 
                    src={`${IMAGE_BASE_URL}${heroMovie.backdrop_path}`} 
                    alt={heroMovie.title}
                    className="w-full h-full object-cover brightness-[0.45]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-2xl space-y-2.5 md:space-y-4">
                  <span className="bg-red-600 text-[8px] md:text-[10px] font-black px-1.5 md:py-0.5 rounded-sm uppercase tracking-wider">
                    Trending Feature
                  </span>
                  <h2 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight drop-shadow-md line-clamp-2 leading-tight">
                    {heroMovie.title || heroMovie.name}
                  </h2>
                  <p className="text-zinc-300 text-xs md:text-base line-clamp-2 md:line-clamp-4 font-normal leading-relaxed max-w-lg">
                    {heroMovie.overview}
                  </p>
                  
                  <div className="flex gap-2.5 pt-1.5">
                    <button 
                      onClick={() => handlePlayTrailer(heroMovie.id)}
                      className="bg-white hover:bg-zinc-200 text-black font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-md flex items-center gap-1.5 transition duration-200 shadow-md text-xs md:text-sm active:scale-95"
                    >
                      <Play size={14} className="md:w-[16px]" fill="black" /> Play Trailer
                    </button>
                    <button 
                      onClick={(e) => toggleWatchlist(heroMovie, e)}
                      className="bg-zinc-800/85 hover:bg-zinc-700 text-white font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-md flex items-center gap-1.5 transition duration-200 backdrop-blur-sm text-xs md:text-sm border border-zinc-700 active:scale-95"
                    >
                      {watchlist.some(item => item.id === heroMovie.id) ? <Check size={14} className="text-red-500 md:w-[16px]" /> : <Plus size={14} className="md:w-[16px]" />} 
                      Watchlist
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Main Content Category Filtering Wrapper */}
            <main className={`px-4 md:px-12 relative z-20 pb-16 space-y-6 md:space-y-12 ${activePage === 'tv' || activePage === 'new' || activePage === 'list' ? 'pt-20' : '-mt-8 md:-mt-12'}`}>
              
              {activePage === 'home' && (
                <>
                  <MovieRow title="Trending Weekly" movies={trending} />
                  <MovieRow title="Critically Acclaimed Shows" movies={topRated} />
                  <MovieRow title="Popular International TV Broadcasts" movies={tvShows} />
                  <MovieRow title="Sci-Fi & Fantasy Deals" movies={sciFiMovies} />
                  <MovieRow title="Romantic Escapes" movies={romanceMovies} />
                  <MovieRow title="Adrenaline-Fueled Action" movies={actionMovies} />
                  <MovieRow title="Suspenseful Thrillers" movies={thrillerMovies} />
                  <MovieRow title="Big Laughs: Comedies" movies={comedyMovies} />
                  <MovieRow title="Nightmare Fuel: Horror" movies={horrorMovies} />
                </>
              )}

              {activePage === 'tv' && (
                <>
                  <MovieRow title="Trending TV Shows" movies={tvShows} />
                  <MovieRow title="Top Rated Broadcast Series" movies={topRated.slice().reverse()} />
                </>
              )}

              {activePage === 'movies' && (
                <>
                  <MovieRow title="Critically Acclaimed" movies={topRated} />
                  <MovieRow title="Sci-Fi & Fantasy Deals" movies={sciFiMovies} />
                  <MovieRow title="Adrenaline-Fueled Action" movies={actionMovies} />
                  <MovieRow title="Suspenseful Thrillers" movies={thrillerMovies} />
                  <MovieRow title="Big Laughs: Comedies" movies={comedyMovies} />
                  <MovieRow title="Nightmare Fuel: Horror" movies={horrorMovies} />
                </>
              )}

              {activePage === 'new' && (
                <>
                  <MovieRow title="Brand New Releases" movies={upcoming} />
                  <MovieRow title="Trending This Week" movies={trending} />
                </>
              )}

              {activePage === 'list' && (
                <section className="min-h-[50vh] pt-4">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-1">My Custom Watchlist</h2>
                  {watchlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                      {watchlist.map((movie) => (
                        <div 
                          key={movie.id} 
                          onClick={() => handlePlayTrailer(movie.id)}
                          className="aspect-video relative rounded-md overflow-hidden cursor-pointer transform hover:scale-105 active:scale-95 hover:z-30 transition duration-300 ease-out shadow-lg group will-change-transform"
                        >
                          <img 
                            src={`${THUMBNAIL_BASE_URL}${movie.backdrop_path || movie.poster_path}`} 
                            alt={movie.title || movie.name}
                            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                          />
                          <button 
                            onClick={(e) => toggleWatchlist(movie, e)}
                            className="absolute top-1.5 right-1.5 bg-black text-white p-1 rounded-full z-30 border border-zinc-700"
                          >
                            <Check size={12} className="text-red-500" />
                          </button>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                            <Play size={36} className="text-white bg-red-600 p-2 rounded-full shadow-lg" fill="white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-zinc-500">
                      <p className="text-sm md:text-base">Your watchlist is empty.</p>
                      <p className="text-xs text-zinc-600 mt-1.5">Click the (+) button on posters to add titles to your custom view.</p>
                    </div>
                  )}
                </section>
              )}
            </main>
          </>
        )}
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900/60 text-zinc-500 text-[10px] md:text-xs py-8 md:py-10 px-4 md:px-12 mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition duration-200">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition duration-200">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition duration-200">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.49 5.2a3 3 0 0 0-2.1-2.1C19.5 2.5 12 2.5 12 2.5s-7.5 0-9.39.6a3 3 0 0 0-2.1 2.1C0 7.09 0 12 0 12s0 4.91.51 6.8a3 3 0 0 0 2.1 2.1c1.89.6 9.39.6 9.39.6s7.5 0 9.39-.6a3 3 0 0 0 2.1-2.1C24 16.91 24 12 24 12s0-4.91-.51-6.8zM9.54 15.56V8.44L15.81 12l-6.27 3.56z" />
              </svg>
            </a>
            <a 
              href="https://github.com/Shazzi00" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-red-600 text-zinc-400 transition-all duration-200 flex items-center gap-1.5 border-l border-zinc-800 pl-5 group"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-200 font-semibold tracking-tight transition-colors duration-200">
                Shazzi00
              </span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3.5 pt-1 text-zinc-500 font-normal select-none leading-relaxed">
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span>Audio Description</span>
              <span>Investor Relations</span>
              <span>Legal Notices</span>
            </div>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span>Help Center</span>
              <span>Jobs</span>
              <span>Cookie Preferences</span>
            </div>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span>Gift Cards</span>
              <span>Terms of Use</span>
              <span>Corporate Information</span>
            </div>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span>Media Center</span>
              <span>Privacy</span>
              <span>Contact Us</span>
            </div>
          </div>

          <div className="pt-3 text-[9px] md:text-[10px] text-zinc-600 font-medium select-none tracking-wide">
            <p>© Netflix Clone Inc. Portfolio Optimization Project By Sheraz Asad.</p>
          </div>

        </div>
      </footer>

      {/* Trailer Modal Portal */}
      <TrailerModal 
        trailerKey={activeTrailerKey} 
        onClose={() => setActiveTrailerKey(null)} 
      />
    </div>
  );
}

export default App;