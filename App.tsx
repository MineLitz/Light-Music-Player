import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Search, Library, Settings, Play, Pause, SkipBack, SkipForward, 
  Repeat, Shuffle, Volume2, Music, Upload, User as UserIcon, LogOut, 
  Disc, Heart, Clock, X, Edit2, Volume1, VolumeX, Plus, MoreHorizontal, Save, Globe, ListPlus, Trash2, Sidebar, Image as ImageIcon,
  MonitorPlay, ChevronDown, Laptop2, Ban, Gamepad2, Wifi, WifiOff, BarChart2, Share2, MoreVertical, ListOrdered, GripVertical, Filter, 
  CornerDownLeft, PlayCircle
} from 'lucide-react';
import { Song, SongMetadata, Playlist, View, User, EQSettings, Language } from './types';
import { 
  initDB, addSongToDB, getAllSongsMetadata, getSongWithCover, updateSongMetadata, 
  createPlaylistDB, getAllPlaylistsDB, updatePlaylist, deletePlaylist
} from './services/db';
import { audioEngine } from './services/audioEngine';
import Equalizer from './components/Equalizer';

// --- Translations --- //

const TRANSLATIONS = {
  en: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    settings: 'Settings',
    welcome: 'Good morning',
    likedSongs: 'Liked Songs',
    yourImports: 'Your Imports',
    searchResults: 'Search Results',
    noSongs: 'No songs found.',
    goBack: 'Go back home',
    songs: 'Songs',
    playlists: 'Playlists',
    importMusic: 'Import Music',
    createPlaylist: 'Create Playlist',
    yourLibrary: 'Your Library',
    playlist: 'Playlist',
    title: 'Title',
    artist: 'Artist',
    album: 'Album',
    duration: 'Duration',
    editInfo: 'Edit Info',
    save: 'Save',
    cancel: 'Cancel',
    changeCover: 'Change Cover',
    addToPlaylist: 'Add to Playlist',
    newPlaylistName: 'New Playlist Name',
    create: 'Create',
    language: 'Language',
    hasCover: 'Has Cover',
    unknownArtist: 'Unknown Artist',
    unknownAlbum: 'Unknown Album',
    lightPlayer: 'Light Player',
    tagline: 'Lightweight. Fast. Local.',
    selectPlaylist: 'Select Playlist',
    addedToPlaylist: 'Added to playlist',
    confirmDeletePlaylist: 'Are you sure you want to delete this playlist?',
    rename: 'Rename',
    delete: 'Delete',
    nowPlaying: 'Now Playing',
    customizeBg: 'Customize Background',
    importGif: 'Import GIF (File)',
    gifUrl: 'GIF URL',
    setBg: 'Set Background',
    resetBg: 'Reset to Default',
    songsInPlaylist: 'songs',
    artistView: 'Artist',
    albumView: 'Album',
    editArtist: 'Edit Artist Name',
    editAlbum: 'Edit Album Name',
    bgMode: 'Now Playing Background',
    bgModeCover: 'Song Cover (Blurred)',
    bgModeCustom: 'Custom GIF/Image',
    devicesAvailable: 'Devices Available',
    discordRpc: 'Discord Rich Presence',
    discordRpcDesc: 'Show what you are listening to on your Discord profile.',
    discordRpcEnabled: 'Activity Enabled',
    discordRpcDisabled: 'Activity Disabled',
    offlineMode: 'Offline Mode',
    offlineModeDesc: 'Prevent the app from attempting to fetch external data.',
    offlineEnabled: 'Offline',
    offlineDisabled: 'Online',
    statistics: 'Statistics',
    queue: 'Queue',
    nextInQueue: 'Next In Queue',
    genre: 'Genre',
    year: 'Year',
    format: 'Format',
    unknown: 'Unknown',
    allGenres: 'All Genres',
    allYears: 'All Years',
    allFormats: 'All Formats',
    previewAlbum: 'Preview Info',
  },
  pt: {
    home: 'Início',
    search: 'Buscar',
    library: 'Biblioteca',
    settings: 'Configurações',
    welcome: 'Bom dia',
    likedSongs: 'Músicas Curtidas',
    yourImports: 'Suas Importações',
    searchResults: 'Resultados da Busca',
    noSongs: 'Nenhuma música encontrada.',
    goBack: 'Voltar ao início',
    songs: 'Músicas',
    playlists: 'Playlists',
    importMusic: 'Importar Música',
    createPlaylist: 'Criar Playlist',
    yourLibrary: 'Sua Biblioteca',
    playlist: 'Playlist',
    title: 'Título',
    artist: 'Artista',
    album: 'Álbum',
    duration: 'Duração',
    editInfo: 'Editar Informações',
    save: 'Salvar',
    cancel: 'Cancelar',
    changeCover: 'Alterar Capa',
    addToPlaylist: 'Adicionar à Playlist',
    newPlaylistName: 'Nome da Nova Playlist',
    create: 'Criar',
    language: 'Idioma',
    hasCover: 'Com Capa',
    unknownArtist: 'Artista Desconhecido',
    unknownAlbum: 'Álbum Desconhecido',
    lightPlayer: 'Light Player',
    tagline: 'Leve. Rápido. Local.',
    selectPlaylist: 'Selecionar Playlist',
    addedToPlaylist: 'Adicionado à playlist',
    confirmDeletePlaylist: 'Tem certeza que deseja excluir esta playlist?',
    rename: 'Renomear',
    delete: 'Excluir',
    nowPlaying: 'Ouvindo Agora',
    customizeBg: 'Personalizar Fundo',
    importGif: 'Importar GIF (Arquivo)',
    gifUrl: 'URL do GIF',
    setBg: 'Definir Fundo',
    resetBg: 'Restaurar Padrão',
    songsInPlaylist: 'músicas',
    artistView: 'Artista',
    albumView: 'Álbum',
    editArtist: 'Editar Nome do Artista',
    editAlbum: 'Editar Nome do Álbum',
    bgMode: 'Fundo do Ouvindo Agora',
    bgModeCover: 'Capa da Música (Desfocada)',
    bgModeCustom: 'GIF/Imagem Personalizada',
    devicesAvailable: 'Dispositivos Disponíveis',
    discordRpc: 'Discord Rich Presence',
    discordRpcDesc: 'Mostre o que você está ouvindo no seu perfil do Discord.',
    discordRpcEnabled: 'Atividade Ativada',
    discordRpcDisabled: 'Atividade Desativada',
    offlineMode: 'Modo Offline',
    offlineModeDesc: 'Impede o aplicativo de tentar buscar dados externos.',
    offlineEnabled: 'Offline',
    offlineDisabled: 'Online',
    statistics: 'Estatísticas',
    queue: 'Fila',
    nextInQueue: 'A Seguir',
    genre: 'Gênero',
    year: 'Ano',
    format: 'Formato',
    unknown: 'Desconhecido',
    allGenres: 'Todos os Gêneros',
    allYears: 'Todos os Anos',
    allFormats: 'Todos os Formatos',
    previewAlbum: 'Ver Info',
  }
};

// --- Helper Functions --- //

const generateCover = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c1 = Math.floor(Math.abs(Math.sin(hash) * 16777215)).toString(16);
  const c2 = Math.floor(Math.abs(Math.cos(hash) * 16777215)).toString(16);
  return `linear-gradient(135deg, #${c1.padEnd(6,'0')}, #${c2.padEnd(6,'0')})`;
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- Main App --- //

const App: React.FC = () => {
  // Global State
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [lang, setLang] = useState<Language>('en');
  
  // Library State
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterFormat, setFilterFormat] = useState('');

  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  
  // Player State
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [currentSongCoverUrl, setCurrentSongCoverUrl] = useState<string | null>(null);

  // Settings State
  const [discordRpcEnabled, setDiscordRpcEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // UI State
  const [editingSong, setEditingSong] = useState<SongMetadata | null>(null);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<SongMetadata | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false); // State for Queue Sidebar
  const [nowPlayingBg, setNowPlayingBg] = useState<string>('');
  const [nowPlayingBgMode, setNowPlayingBgMode] = useState<'cover' | 'custom'>('cover');
  
  // Playlist/Artist/Album Edit State
  const [playlistIdEditing, setPlaylistIdEditing] = useState<string | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editHeaderValue, setEditHeaderValue] = useState('');

  // Settings Temp State
  const [tempGifUrl, setTempGifUrl] = useState('');

  // EQ State
  const [eqSettings, setEqSettings] = useState<EQSettings>({
    enabled: false,
    presetName: 'Flat',
    bands: [
      { frequency: 60, gain: 0, type: 'lowshelf' },
      { frequency: 150, gain: 0, type: 'peaking' },
      { frequency: 400, gain: 0, type: 'peaking' },
      { frequency: 1000, gain: 0, type: 'peaking' },
      { frequency: 2400, gain: 0, type: 'peaking' },
      { frequency: 15000, gain: 0, type: 'highshelf' },
    ]
  });

  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key];

  // Derived
  const currentSongMeta = songs.find(s => s.id === currentSongId);
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  
  // Unique Filter Values
  const availableGenres = Array.from(new Set(songs.map(s => s.genre).filter(Boolean))).sort();
  const availableYears = Array.from(new Set(songs.map(s => s.year).filter(Boolean))).sort().reverse();
  const availableFormats = Array.from(new Set(songs.map(s => s.format).filter(Boolean))).sort();

  // Filter logic based on view AND search filters
  let filteredSongs = songs;

  // 1. View Filtering
  if (currentView === 'LIKED') {
      filteredSongs = songs.filter(s => likedSongs.has(s.id));
  } else if (currentView === 'PLAYLIST' && selectedPlaylistId) {
      filteredSongs = songs.filter(s => s.playlistIds?.includes(selectedPlaylistId));
  } else if (currentView === 'ARTIST' && selectedArtist) {
      filteredSongs = songs.filter(s => s.artist === selectedArtist);
  } else if (currentView === 'ALBUM' && selectedAlbum) {
      filteredSongs = songs.filter(s => s.album === selectedAlbum);
  }

  // 2. Search Text Filtering
  if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredSongs = filteredSongs.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
      );
  }

  // 3. Metadata Filtering
  if (currentView === 'SEARCH' || currentView === 'LIBRARY') {
      if (filterGenre) filteredSongs = filteredSongs.filter(s => s.genre === filterGenre);
      if (filterYear) filteredSongs = filteredSongs.filter(s => s.year === filterYear);
      if (filterFormat) filteredSongs = filteredSongs.filter(s => s.format === filterFormat);
  }

  const isCurrentLiked = currentSongId ? likedSongs.has(currentSongId) : false;

  // --- Effects --- //

  // Initial Load (Settings & Data)
  useEffect(() => {
    const savedLang = localStorage.getItem('lmp_lang') as Language;
    if (savedLang) setLang(savedLang);

    const savedLiked = localStorage.getItem('lmp_liked');
    if (savedLiked) {
      try {
        setLikedSongs(new Set(JSON.parse(savedLiked)));
      } catch (e) { console.error("Error loading liked songs", e); }
    }

    const savedBg = localStorage.getItem('lmp_now_playing_bg');
    if (savedBg) setNowPlayingBg(savedBg);
    const savedBgMode = localStorage.getItem('lmp_now_playing_bg_mode');
    if (savedBgMode) setNowPlayingBgMode(savedBgMode as 'cover' | 'custom');

    const savedPlayer = localStorage.getItem('lmp_player_prefs');
    if (savedPlayer) {
        try {
            const prefs = JSON.parse(savedPlayer);
            if (typeof prefs.volume === 'number') {
                setVolume(prefs.volume);
                audioEngine.setVolume(prefs.volume);
            }
            if (typeof prefs.isShuffle === 'boolean') setIsShuffle(prefs.isShuffle);
            if (typeof prefs.isRepeat === 'boolean') setIsRepeat(prefs.isRepeat);
            
            if (prefs.lastSongId) {
                loadLastSong(prefs.lastSongId);
            }
        } catch(e) { console.error("Error loading preferences", e); }
    }

    const savedRpc = localStorage.getItem('lmp_discord_rpc');
    if (savedRpc !== null) {
        setDiscordRpcEnabled(savedRpc === 'true');
    }

    const savedOffline = localStorage.getItem('lmp_offline_mode');
    if (savedOffline !== null) {
        setOfflineMode(savedOffline === 'true');
    }
    
    loadLibrary();

    const el = audioEngine.getElement();
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration);
    const onEnded = () => handleNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('durationchange', onDurationChange);
    el.addEventListener('ended', onEnded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('durationchange', onDurationChange);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    audioEngine.updateEQ(eqSettings.bands, eqSettings.enabled);
  }, [eqSettings]);

  useEffect(() => {
      const prefs = {
          volume,
          isShuffle,
          isRepeat,
          lastSongId: currentSongId
      };
      localStorage.setItem('lmp_player_prefs', JSON.stringify(prefs));
  }, [volume, isShuffle, isRepeat, currentSongId]);

  // Media Session API (Background Playback)
  useEffect(() => {
      if (!currentSongMeta) return;

      if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
              title: currentSongMeta.title,
              artist: currentSongMeta.artist,
              album: currentSongMeta.album,
              artwork: [
                  { src: currentSongCoverUrl || '', sizes: '512x512', type: 'image/png' }
              ]
          });

          // Play/Pause handlers rely on state closure; wrapping them or using ref is safer but effect re-runs on isPlaying
          navigator.mediaSession.setActionHandler('play', () => {
              audioEngine.togglePlay();
              setIsPlaying(true);
          });
          navigator.mediaSession.setActionHandler('pause', () => {
              audioEngine.togglePlay();
              setIsPlaying(false);
          });
          
          // These need access to the latest 'queue' and 'isShuffle', so they are dependent on them
          // We define them here to ensure they use current scope
          navigator.mediaSession.setActionHandler('previoustrack', () => {
             // Logic from handlePrev
             if (queue.length === 0) return;
             if (audioEngine.getElement().currentTime > 3) {
                audioEngine.seek(0);
                return;
             }
             const currentIdx = queue.indexOf(currentSongId || '');
             const prevIndex = currentIdx - 1;
             if (prevIndex >= 0) {
                 // Trigger play logic - slightly complex since playSong is async/in-component
                 // For now, we manually find the ID and play.
                 // Ideally this should call handlePrev directly if it was stable
                 // We will just invoke the function from scope if we can ensure it's up to date
             }
          });
          navigator.mediaSession.setActionHandler('nexttrack', () => {
             // Logic from handleNext
          });
          
          navigator.mediaSession.setActionHandler('seekto', (details) => {
              if (details.seekTime !== undefined) {
                   audioEngine.seek(details.seekTime);
                   setCurrentTime(details.seekTime);
              }
          });
      }
  }, [currentSongMeta, currentSongCoverUrl]);

  // Separate effect for handlers that need fresh state (Queue/Shuffle)
  useEffect(() => {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
          navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      }
  }, [queue, isShuffle, isRepeat, currentSongId]); // Dependencies for navigation logic


  // Discord RPC Logic
  useEffect(() => {
    if (!discordRpcEnabled || offlineMode) return;
    
    if (currentSongMeta) {
        const payload: any = {
            details: currentSongMeta.title,
            state: `${currentSongMeta.artist} • ${currentSongMeta.album}`,
            largeImageKey: 'light_music_logo',
            largeImageText: 'Light Music Player',
            smallImageKey: isPlaying ? 'play_icon' : 'pause_icon',
            smallImageText: isPlaying ? 'Playing' : 'Paused',
            instance: false,
        };

        if (isPlaying) {
            const startTimestamp = Math.floor(Date.now() / 1000);
            const endTimestamp = startTimestamp + (duration - currentTime);
            payload.startTimestamp = startTimestamp;
            payload.endTimestamp = Math.floor(endTimestamp);
        }

        console.log('[Discord RPC] Updating Presence:', payload);
    } else {
        console.log('[Discord RPC] Clearing Presence');
    }
  }, [currentSongMeta, isPlaying, discordRpcEnabled, offlineMode]);

  // --- Handlers --- //

  const goToArtist = (artist: string) => {
    setSelectedArtist(artist);
    setCurrentView('ARTIST');
    setIsEditingHeader(false);
  };

  const goToAlbum = (album: string) => {
    setSelectedAlbum(album);
    setCurrentView('ALBUM');
    setIsEditingHeader(false);
  };

  const loadLastSong = async (id: string) => {
      try {
          const meta = await getSongWithCover(id);
          if (meta) {
              setCurrentSongId(id);
              if (meta.coverBlob) {
                  setCurrentSongCoverUrl(URL.createObjectURL(meta.coverBlob));
              }
              audioEngine.init(); 
              const url = URL.createObjectURL(meta.fileBlob);
              audioEngine.getElement().src = url;
          }
      } catch (e) { console.log("Could not restore last song", e); }
  };

  const loadLibrary = async () => {
    try {
      const allSongs = await getAllSongsMetadata();
      const allPlaylists = await getAllPlaylistsDB();
      setSongs(allSongs);
      setPlaylists(allPlaylists);
    } catch (err) {
      console.error("Failed to load library", err);
    }
  };

  const changeLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('lmp_lang', l);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const files: File[] = Array.from(e.target.files);
    
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';

      const song: Song = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: t('unknownArtist'),
        album: t('unknownAlbum'),
        duration: 0, 
        fileBlob: file,
        addedAt: Date.now(),
        format: ext,
        genre: t('unknown'),
        year: ''
      };
      await addSongToDB(song);
    }
    
    loadLibrary();
  };

  const playSong = async (id: string) => {
    if (id === currentSongId) {
      audioEngine.togglePlay();
      return;
    }

    try {
      const fullSong = await getSongWithCover(id);
      if (fullSong) {
        if (currentSongCoverUrl) URL.revokeObjectURL(currentSongCoverUrl);
        let coverUrl = null;
        if (fullSong.coverBlob) {
            coverUrl = URL.createObjectURL(fullSong.coverBlob);
        }
        setCurrentSongCoverUrl(coverUrl);
        audioEngine.playBlob(fullSong.fileBlob);
        setCurrentSongId(id);
        
        if (currentView === 'LIKED') {
            setQueue(songs.filter(s => likedSongs.has(s.id)).map(s => s.id));
        } else if (currentView === 'PLAYLIST' && selectedPlaylistId) {
            setQueue(songs.filter(s => s.playlistIds?.includes(selectedPlaylistId)).map(s => s.id));
        } else if (currentView === 'ARTIST' && selectedArtist) {
            setQueue(songs.filter(s => s.artist === selectedArtist).map(s => s.id));
        } else if (currentView === 'ALBUM' && selectedAlbum) {
            setQueue(songs.filter(s => s.album === selectedAlbum).map(s => s.id));
        } else {
            if ((currentView === 'SEARCH' || currentView === 'LIBRARY') && (filterGenre || filterYear || filterFormat)) {
                 setQueue(filteredSongs.map(s => s.id));
            } else {
                if (queue.length === 0 || !queue.includes(id)) {
                    setQueue(songs.map(s => s.id));
                }
            }
        }
      }
    } catch (err) {
      console.error("Error playing song", err);
    }
  };

  const handleNext = () => {
    if (!queue.length) return;
    let nextIndex = -1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      const currentIdx = queue.indexOf(currentSongId || '');
      nextIndex = currentIdx + 1;
    }
    if (nextIndex >= queue.length) {
      if (isRepeat) nextIndex = 0;
      else return; 
    }
    playSong(queue[nextIndex]);
  };

  const handlePrev = () => {
    if (!queue.length) return;
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    const currentIdx = queue.indexOf(currentSongId || '');
    const prevIndex = currentIdx - 1;
    if (prevIndex >= 0) playSong(queue[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    audioEngine.seek(time);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioEngine.setVolume(v);
    if (v > 0) setLastVolume(v);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
      audioEngine.setVolume(0);
    } else {
      setVolume(lastVolume);
      audioEngine.setVolume(lastVolume);
    }
  };

  const handleToggleLike = (id: string) => {
    const newLiked = new Set(likedSongs);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedSongs(newLiked);
    localStorage.setItem('lmp_liked', JSON.stringify(Array.from(newLiked)));
  };

  const handleCreatePlaylist = async () => {
      if(!newPlaylistName.trim()) return;
      await createPlaylistDB(newPlaylistName);
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      loadLibrary();
  };

  const handleRenamePlaylist = async (id: string) => {
      if(!editPlaylistName.trim()) return;
      await updatePlaylist(id, { name: editPlaylistName });
      setPlaylistIdEditing(null);
      setEditPlaylistName('');
      loadLibrary();
  };

  const handleDeletePlaylist = async (id: string) => {
      if(window.confirm(t('confirmDeletePlaylist'))) {
          if (currentView === 'PLAYLIST' && selectedPlaylistId === id) {
              setCurrentView('LIBRARY');
              setSelectedPlaylistId(null);
          }
          await deletePlaylist(id);
          loadLibrary();
      }
  };

  const handleQuickAddToPlaylist = async (playlistId: string) => {
      if (!songToAddToPlaylist) return;
      const currentIds = songToAddToPlaylist.playlistIds || [];
      if (!currentIds.includes(playlistId)) {
          const newIds = [...currentIds, playlistId];
          await updateSongMetadata(songToAddToPlaylist.id, { playlistIds: newIds });
          loadLibrary();
      }
      setSongToAddToPlaylist(null);
  };

  const handleUpdateArtistName = async () => {
      if (!selectedArtist || !editHeaderValue.trim()) return;
      const songsToUpdate = songs.filter(s => s.artist === selectedArtist);
      for (const s of songsToUpdate) {
          await updateSongMetadata(s.id, { artist: editHeaderValue });
      }
      setSelectedArtist(editHeaderValue);
      setIsEditingHeader(false);
      loadLibrary();
  };

  const handleUpdateAlbumName = async () => {
      if (!selectedAlbum || !editHeaderValue.trim()) return;
      const songsToUpdate = songs.filter(s => s.album === selectedAlbum);
      for (const s of songsToUpdate) {
          await updateSongMetadata(s.id, { album: editHeaderValue });
      }
      setSelectedAlbum(editHeaderValue);
      setIsEditingHeader(false);
      loadLibrary();
  };

  const handleSaveMetadata = async (
      title: string, 
      artist: string, 
      album: string, 
      genre: string,
      year: string,
      coverFile: File | null, 
      selectedPlaylists: string[]
    ) => {
      if (!editingSong) return;
      const updates: Partial<Song> = { title, artist, album, genre, year, playlistIds: selectedPlaylists };
      if (coverFile) updates.coverBlob = coverFile;

      await updateSongMetadata(editingSong.id, updates);
      
      if (currentSongId === editingSong.id && coverFile) {
          if (currentSongCoverUrl) URL.revokeObjectURL(currentSongCoverUrl);
          setCurrentSongCoverUrl(URL.createObjectURL(coverFile));
      }
      setEditingSong(null);
      loadLibrary();
  };

  const handleBgImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if(ev.target?.result) {
                  const data = ev.target.result as string;
                  setNowPlayingBg(data);
                  localStorage.setItem('lmp_now_playing_bg', data);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleSetBgUrl = () => {
      if(tempGifUrl) {
          setNowPlayingBg(tempGifUrl);
          localStorage.setItem('lmp_now_playing_bg', tempGifUrl);
          setTempGifUrl('');
      }
  };

  const getSliderBackground = (value: number, max: number) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return `linear-gradient(to right, #1db954 ${percentage}%, #4b5563 ${percentage}%)`;
  };

  const toggleDiscordRpc = () => {
      const newState = !discordRpcEnabled;
      setDiscordRpcEnabled(newState);
      localStorage.setItem('lmp_discord_rpc', String(newState));
  };

  const toggleOfflineMode = () => {
      const newState = !offlineMode;
      setOfflineMode(newState);
      localStorage.setItem('lmp_offline_mode', String(newState));
      if (newState) {
          console.log('[Discord RPC] Offline Mode enabled. Presence cleared.');
      }
  };

  // Drag and Drop Logic for Queue
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData("text/plain");
    if (!dragIndexStr) return;
    
    const dragIndex = parseInt(dragIndexStr, 10);
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newQueue = [...queue];
    const [removed] = newQueue.splice(dragIndex, 1);
    newQueue.splice(dropIndex, 0, removed);
    setQueue(newQueue);
  };

  // --- Components --- //

  const AddToPlaylistModal = () => {
      if (!songToAddToPlaylist) return null;
      return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-[#282828] rounded-xl p-6 w-full max-w-sm shadow-2xl border border-white/10">
                <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">{t('selectPlaylist')}</h3>
                      <button onClick={() => setSongToAddToPlaylist(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {playlists.length === 0 && <p className="text-gray-500 italic text-sm text-center py-4">No playlists yet.</p>}
                    {playlists.map(pl => (
                        <button 
                            key={pl.id}
                            onClick={() => handleQuickAddToPlaylist(pl.id)}
                            className="w-full text-left p-3 rounded hover:bg-[#333] flex items-center gap-3 transition"
                        >
                            <div className="w-8 h-8 bg-gray-700 flex items-center justify-center rounded"><Music size={14}/></div>
                            <span className="text-white font-medium">{pl.name}</span>
                        </button>
                    ))}
                </div>
             </div>
        </div>
      );
  }

  const EditModal = ({ song, onClose }: { song: SongMetadata, onClose: () => void }) => {
      const [title, setTitle] = useState(song.title);
      const [artist, setArtist] = useState(song.artist);
      const [album, setAlbum] = useState(song.album);
      const [genre, setGenre] = useState(song.genre || '');
      const [year, setYear] = useState(song.year || '');
      const [coverFile, setCoverFile] = useState<File | null>(null);
      const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>(song.playlistIds || []);

      const togglePlaylist = (pid: string) => {
          if (selectedPlaylists.includes(pid)) {
              setSelectedPlaylists(selectedPlaylists.filter(id => id !== pid));
          } else {
              setSelectedPlaylists([...selectedPlaylists, pid]);
          }
      };

      return (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[#282828] rounded-xl p-6 w-full max-w-md shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">{t('editInfo')}</h3>
                      <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-white" /></button>
                  </div>

                  <div className="space-y-4">
                      {/* Cover Input */}
                      <div className="flex justify-center mb-4">
                          <label className="w-32 h-32 bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition overflow-hidden relative group">
                              {coverFile ? (
                                  <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" />
                              ) : (
                                  song.hasCover ? 
                                  <div className="w-full h-full bg-cover" style={{ backgroundImage: `url(${generateCover(song.title)})` }}></div>
                                  : <Music size={40} className="text-gray-400" />
                              )}
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <span className="text-xs font-bold text-white text-center px-2">{t('changeCover')}</span>
                              </div>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setCoverFile(e.target.files[0])} />
                          </label>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">{t('title')}</label>
                          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded focus:ring-2 ring-green-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">{t('artist')}</label>
                          <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded focus:ring-2 ring-green-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">{t('album')}</label>
                          <input type="text" value={album} onChange={e => setAlbum(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded focus:ring-2 ring-green-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">{t('genre')}</label>
                            <input type="text" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded focus:ring-2 ring-green-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">{t('year')}</label>
                            <input type="text" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded focus:ring-2 ring-green-500 outline-none" />
                        </div>
                      </div>

                      <div className="space-y-2 mt-2">
                           <label className="text-xs font-bold text-gray-400 uppercase">{t('addToPlaylist')}</label>
                           <div className="max-h-32 overflow-y-auto bg-[#181818] rounded p-2 space-y-1">
                               {playlists.length === 0 && <p className="text-xs text-gray-500 italic">No playlists created.</p>}
                               {playlists.map(pl => (
                                   <div key={pl.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#333] p-1 rounded" onClick={() => togglePlaylist(pl.id)}>
                                       <div className={`w-4 h-4 border border-gray-500 rounded flex items-center justify-center ${selectedPlaylists.includes(pl.id) ? 'bg-green-500 border-green-500' : ''}`}>
                                           {selectedPlaylists.includes(pl.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                       </div>
                                       <span className="text-sm text-gray-300 truncate">{pl.name}</span>
                                   </div>
                               ))}
                           </div>
                      </div>

                      <button 
                        onClick={() => handleSaveMetadata(title, artist, album, genre, year, coverFile, selectedPlaylists)}
                        className="w-full py-3 bg-green-500 text-black font-bold rounded-full hover:scale-105 transition mt-4"
                      >
                          {t('save')}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const QueueSidebar = () => {
    return (
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] z-[70] transition-transform duration-300 shadow-2xl bg-[#121212] flex flex-col border-l border-[#282828] ${isQueueOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#282828]">
            <h2 className="text-xl font-bold text-white">{t('queue')}</h2>
            <button onClick={() => setIsQueueOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">{t('nowPlaying')}</h3>
            {currentSongMeta ? (
                 <div className="bg-[#282828] p-3 rounded-lg flex items-center gap-3 mb-6 border border-green-500/30">
                     <div className="w-10 h-10 rounded bg-gray-800 flex-shrink-0 relative">
                        {currentSongCoverUrl ? (
                            <img src={currentSongCoverUrl} className="w-full h-full object-cover rounded" />
                        ) : (
                            <div className="w-full h-full rounded" style={{ background: generateCover(currentSongMeta.title) }}></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                           <BarChart2 size={16} className="text-green-500" />
                        </div>
                     </div>
                     <div className="flex-1 overflow-hidden">
                         <div className="text-green-500 font-bold truncate">{currentSongMeta.title}</div>
                         <div className="text-gray-400 text-sm truncate">{currentSongMeta.artist}</div>
                     </div>
                 </div>
            ) : (
                <p className="text-gray-500 text-sm italic mb-6">Nothing playing</p>
            )}

            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">{t('nextInQueue')}</h3>
            {queue.length === 0 && <p className="text-gray-500 text-sm italic">Queue is empty</p>}
            
            {/* Reorderable List */}
            {queue.map((songId, index) => {
                const song = songs.find(s => s.id === songId);
                if (!song) return null;
                const isPlaying = song.id === currentSongId;
                if (isPlaying) return null; // Already shown above

                return (
                    <div 
                        key={`${song.id}-${index}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, index)}
                        className="group flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-move transition bg-[#181818]"
                    >
                        <GripVertical size={16} className="text-gray-600 group-hover:text-gray-400" />
                        <div className="w-10 h-10 rounded bg-gray-800 flex-shrink-0 relative overflow-hidden">
                             {song.hasCover ? (
                                <div className="w-full h-full bg-cover" style={{ backgroundImage: `url(${generateCover(song.title)})` }}></div>
                             ) : (
                                <div className="w-full h-full" style={{ background: generateCover(song.title) }}></div>
                             )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-white font-medium truncate">{song.title}</div>
                            <div className="text-gray-400 text-xs truncate">{song.artist}</div>
                        </div>
                        <button 
                            className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                const newQueue = [...queue];
                                newQueue.splice(index, 1);
                                setQueue(newQueue);
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };

  const NowPlayingFullView = () => {
    if (!currentSongMeta) return null;

    // Simulate "11 days ago • 16 songs..." description from existing metadata
    const description = [
        currentSongMeta.year ? `${currentSongMeta.year}` : null,
        currentSongMeta.duration ? formatTime(currentSongMeta.duration) : null,
        currentSongMeta.genre,
        currentSongMeta.format
    ].filter(Boolean).join(' • ');

    const titleList = [currentSongMeta.title, "Up Next", "More Songs", "Suggested"].join(' • ');

    return (
      <div 
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isNowPlayingOpen ? 'opacity-100 pointer-events-auto bg-black/80 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsNowPlayingOpen(false)}
      >
         {/* Card Container matching the reference photo */}
         <div 
            className="w-full max-w-2xl bg-[#6d4127] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row transition-transform scale-100 hover:scale-[1.01] duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
            style={{
                // Fallback color if no cover, but try to use a brown/warm tone like the photo
                background: 'linear-gradient(135deg, #8B4513 0%, #5D3318 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
         >
            {/* Top/Left Image Section */}
            <div className="md:w-1/2 p-6 flex flex-col relative">
                 <div className="aspect-square w-full rounded-lg shadow-xl overflow-hidden relative group bg-black/20">
                    {currentSongCoverUrl ? (
                        <img src={currentSongCoverUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full" style={{ background: generateCover(currentSongMeta.title) }}></div>
                    )}
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button onClick={() => audioEngine.togglePlay()} className="transform hover:scale-110 transition">
                            {isPlaying ? <Pause size={48} className="text-white fill-white"/> : <Play size={48} className="text-white fill-white"/>}
                        </button>
                    </div>
                 </div>
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-6 flex flex-col text-[#FFE4D6]"> {/* Light warm text color */}
                 <div className="flex justify-between items-start mb-2">
                     <span className="font-medium text-sm opacity-80 uppercase tracking-wide">{currentSongMeta.album || t('nowPlaying')}</span>
                     <button className="text-[#FFE4D6] hover:text-white" onClick={() => setIsNowPlayingOpen(false)}>
                         <MoreHorizontal size={24} />
                     </button>
                 </div>

                 <div className="flex-1 flex flex-col justify-center mb-6">
                     <p className="text-sm font-medium mb-3 opacity-90 leading-relaxed">
                         {description}
                         <span className="opacity-70 block mt-1 text-xs">
                             {currentSongMeta.artist} • {titleList}
                         </span>
                     </p>
                     <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{currentSongMeta.title}</h1>
                 </div>

                 {/* Bottom Controls */}
                 <div className="mt-auto flex items-center justify-between">
                     <button className="flex items-center gap-2 bg-[#4A2814]/60 hover:bg-[#4A2814]/80 backdrop-blur px-4 py-2 rounded-full transition text-sm font-bold text-white group">
                         <CornerDownLeft size={16} className="group-hover:-translate-x-1 transition"/>
                         {t('previewAlbum')}
                     </button>

                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => handleToggleLike(currentSongMeta.id)}
                            className="w-10 h-10 rounded-full border border-[#FFE4D6]/30 flex items-center justify-center hover:bg-white/10 transition text-white"
                         >
                            <Plus size={20} className={isCurrentLiked ? "rotate-45 transition-transform" : "transition-transform"}/>
                         </button>
                         <button 
                            onClick={() => audioEngine.togglePlay()}
                            className="bg-white text-[#5D3318] rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 transition shadow-lg"
                         >
                            {isPlaying ? <Pause size={24} className="fill-current"/> : <Play size={24} className="fill-current ml-1"/>}
                         </button>
                     </div>
                 </div>
            </div>
         </div>
      </div>
    );
  };

  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-black/80 backdrop-blur-md border-t border-[#282828] h-[60px] z-50 flex justify-around items-center pb-safe">
        <button 
            onClick={() => setCurrentView('HOME')} 
            className={`flex flex-col items-center gap-1 ${currentView === 'HOME' ? 'text-white' : 'text-gray-500'}`}
        >
            <Home size={24} strokeWidth={currentView === 'HOME' ? 3 : 2}/>
            <span className="text-[10px] font-medium">{t('home')}</span>
        </button>
        <button 
            onClick={() => setCurrentView('SEARCH')} 
            className={`flex flex-col items-center gap-1 ${currentView === 'SEARCH' ? 'text-white' : 'text-gray-500'}`}
        >
            <Search size={24} strokeWidth={currentView === 'SEARCH' ? 3 : 2}/>
            <span className="text-[10px] font-medium">{t('search')}</span>
        </button>
        <button 
            onClick={() => setCurrentView('LIBRARY')} 
            className={`flex flex-col items-center gap-1 ${currentView === 'LIBRARY' ? 'text-white' : 'text-gray-500'}`}
        >
            <Library size={24} strokeWidth={currentView === 'LIBRARY' ? 3 : 2}/>
            <span className="text-[10px] font-medium">{t('library')}</span>
        </button>
    </div>
  );

  const MiniPlayerMobile = () => {
    if (!currentSongMeta) return null;
    return (
        <div 
            className="md:hidden fixed bottom-[60px] left-2 right-2 bg-[#282828] rounded-md p-2 flex items-center justify-between z-40 shadow-xl border-b border-black/20"
            onClick={() => setIsNowPlayingOpen(true)}
        >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                 <div className="w-10 h-10 rounded bg-gray-800 flex-shrink-0 relative">
                    {currentSongCoverUrl ? (
                        <img src={currentSongCoverUrl} className="w-full h-full object-cover rounded" />
                    ) : (
                        <div className="w-full h-full rounded" style={{ background: generateCover(currentSongMeta.title) }}></div>
                    )}
                 </div>
                 <div className="flex flex-col overflow-hidden">
                     <span className="text-white text-sm font-bold truncate">{currentSongMeta.title}</span>
                     <span className="text-gray-400 text-xs truncate">{currentSongMeta.artist}</span>
                 </div>
            </div>
            <div className="flex items-center gap-3 pr-2">
                 <button onClick={(e) => { e.stopPropagation(); handleToggleLike(currentSongMeta.id); }}>
                     <Heart size={20} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-white"} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); audioEngine.togglePlay(); }}>
                     {isPlaying ? <Pause size={24} className="fill-white text-white" /> : <Play size={24} className="fill-white text-white" />}
                 </button>
            </div>
            {/* Simple Progress Bar Overlay */}
            <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-600 rounded-b-md overflow-hidden">
                <div 
                    className="h-full bg-white" 
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
            </div>
        </div>
    );
  };

  const DesktopFooter = () => (
    <footer className="hidden md:flex h-[90px] bg-[#181818] border-t border-[#282828] px-4 items-center justify-between z-50 relative">
          <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
             {currentSongMeta ? (
                 <>
                    <div className="w-14 h-14 bg-gray-800 rounded shadow-md flex-shrink-0 relative overflow-hidden group">
                        {currentSongCoverUrl ? (
                            <img src={currentSongCoverUrl} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="w-full h-full" style={{ background: generateCover(currentSongMeta.title) }}></div>
                        )}
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition" onClick={() => setIsNowPlayingOpen(!isNowPlayingOpen)}>
                             <ChevronDown size={20} className="text-white rotate-180"/>
                        </button>
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                        <div className="text-sm font-medium text-white truncate hover:underline cursor-pointer" onClick={() => setIsNowPlayingOpen(true)}>{currentSongMeta.title}</div>
                        <div className="text-xs text-gray-400 truncate hover:underline cursor-pointer" onClick={() => goToArtist(currentSongMeta.artist)}>{currentSongMeta.artist}</div>
                    </div>
                    <button 
                        className={`hover:text-white transition ${isCurrentLiked ? "text-green-500" : "text-gray-400"}`}
                        onClick={() => currentSongId && handleToggleLike(currentSongId)}
                    >
                        <Heart size={16} className={isCurrentLiked ? "fill-green-500" : ""} />
                    </button>
                 </>
             ) : (
                 <div className="text-xs text-gray-500">No song selected</div>
             )}
          </div>

          <div className="flex flex-col items-center max-w-[40%] w-full gap-2">
             <div className="flex items-center gap-6">
                <button 
                  className={`relative text-gray-400 hover:text-white transition ${isShuffle ? 'text-green-500' : ''}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                  title="Shuffle"
                >
                    <Shuffle size={16} />
                    {isShuffle && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />}
                </button>
                <button className="text-gray-400 hover:text-white transition" onClick={handlePrev}>
                    <SkipBack size={20} className="fill-current" />
                </button>
                <button 
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                  onClick={() => {
                      if(!currentSongId && songs.length > 0) playSong(songs[0].id);
                      else audioEngine.togglePlay();
                  }}
                >
                    {isPlaying ? <Pause size={20} className="text-black fill-black" /> : <Play size={20} className="text-black fill-black ml-0.5" />}
                </button>
                <button className="text-gray-400 hover:text-white transition" onClick={handleNext}>
                    <SkipForward size={20} className="fill-current" />
                </button>
                <button 
                  className={`relative text-gray-400 hover:text-white transition ${isRepeat ? 'text-green-500' : ''}`}
                  onClick={() => setIsRepeat(!isRepeat)}
                  title="Repeat"
                >
                    <Repeat size={16} />
                    {isRepeat && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />}
                </button>
             </div>
             
             <div className="w-full flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="min-w-[40px] text-right">{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="w-full h-1 bg-[#4b5563] rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all outline-none"
                  style={{
                      background: getSliderBackground(currentTime, duration)
                  }}
                />
                <span className="min-w-[40px]">{formatTime(duration)}</span>
             </div>
          </div>

          <div className="w-[30%] min-w-[180px] flex justify-end items-center gap-2">
              <button 
                  className={`text-gray-400 hover:text-white transition ${isQueueOpen ? 'text-green-500' : ''}`}
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  title={t('queue')}
              >
                  <ListOrdered size={20} />
              </button>
              <button 
                  className={`text-gray-400 hover:text-white transition ${isNowPlayingOpen ? 'text-green-500' : ''}`}
                  onClick={() => setIsNowPlayingOpen(!isNowPlayingOpen)}
                  title={t('nowPlaying')}
              >
                  <Sidebar size={20} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={toggleMute}>
                  {volume === 0 ? <VolumeX size={18} /> : (volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />)}
              </button>
              <div className="flex items-center gap-2 w-32 group">
                 <input 
                   type="range" 
                   min="0" 
                   max="1" 
                   step="0.01" 
                   value={volume} 
                   onChange={handleVolume}
                   className="w-full h-1 bg-[#4b5563] rounded-full appearance-none cursor-pointer group-hover:h-1.5 transition-all outline-none"
                   style={{
                       background: getSliderBackground(volume, 1)
                   }}
                 />
              </div>
          </div>
      </footer>
  );

  // --- Views --- //

  return (
    <div className="h-screen w-screen bg-black text-gray-300 flex flex-col font-sans select-none overflow-hidden">
      
      {editingSong && <EditModal song={editingSong} onClose={() => setEditingSong(null)} />}
      <AddToPlaylistModal />
      <NowPlayingFullView />
      <QueueSidebar />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar (Desktop Only) */}
        <nav className="w-64 bg-black flex flex-col gap-2 p-2 min-w-[200px] hidden md:flex z-20">
          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-6 px-2">
               <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center shadow-lg">
                   <Music className="text-white fill-white" size={18} />
               </div>
               <span className="font-bold text-lg text-white">Light Player</span>
            </div>
            <ul className="space-y-4 font-medium">
              <li onClick={() => setCurrentView('HOME')} className={`flex items-center gap-4 cursor-pointer hover:text-white transition ${currentView === 'HOME' ? 'text-white' : ''}`}>
                <Home size={24} /> {t('home')}
              </li>
              <li onClick={() => { setCurrentView('SEARCH'); setSearchQuery(''); }} className={`flex items-center gap-4 cursor-pointer hover:text-white transition ${currentView === 'SEARCH' ? 'text-white' : ''}`}>
                <Search size={24} /> {t('search')}
              </li>
              <li onClick={() => setCurrentView('LIBRARY')} className={`flex items-center gap-4 cursor-pointer hover:text-white transition ${currentView === 'LIBRARY' ? 'text-white' : ''}`}>
                <Library size={24} /> {t('library')}
              </li>
            </ul>
          </div>

          <div className="bg-[#121212] rounded-lg p-4 flex-1 overflow-auto">
             <div className="flex justify-between items-center mb-4 text-gray-400">
                <span className="font-bold hover:text-white transition cursor-pointer">{t('yourLibrary')}</span>
                <div className="flex gap-2">
                    <button onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)} className="hover:text-white" title={t('createPlaylist')}>
                        <Plus size={20} />
                    </button>
                    <label className="cursor-pointer hover:text-white" title={t('importMusic')}>
                        <Upload size={20} />
                        <input type="file" multiple accept="audio/mp3, audio/wav, audio/ogg" className="hidden" onChange={handleImport} />
                    </label>
                </div>
             </div>

             {/* Playlist Creation Input */}
             {isCreatingPlaylist && (
                 <div className="mb-4 bg-[#282828] p-2 rounded animate-fade-in">
                     <input 
                        type="text" 
                        placeholder={t('newPlaylistName')}
                        className="w-full bg-black text-white text-xs p-2 rounded mb-2 outline-none"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                     />
                     <div className="flex gap-2">
                         <button onClick={handleCreatePlaylist} className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">{t('create')}</button>
                         <button onClick={() => setIsCreatingPlaylist(false)} className="text-gray-400 text-xs px-2 py-1">{t('cancel')}</button>
                     </div>
                 </div>
             )}

             <div className="flex flex-col gap-2 text-sm">
                <div onClick={() => setCurrentView('LIKED')} className={`flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer transition ${currentView === 'LIKED' ? 'bg-[#2a2a2a] text-white' : ''}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-blue-500 flex items-center justify-center rounded">
                        <Heart size={16} className="text-white fill-white" />
                    </div>
                    <div>
                        <p className={currentView === 'LIKED' ? 'text-green-500' : 'text-white'}>{t('likedSongs')}</p>
                        <p className="text-xs">{t('playlist')}</p>
                    </div>
                </div>
                {playlists.map(pl => (
                    <div 
                        key={pl.id} 
                        className={`group flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer relative min-h-[56px] transition ${(currentView === 'PLAYLIST' && selectedPlaylistId === pl.id) ? 'bg-[#2a2a2a]' : ''}`}
                        onClick={() => { setCurrentView('PLAYLIST'); setSelectedPlaylistId(pl.id); }}
                    >
                        {playlistIdEditing === pl.id ? (
                            <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    className="w-full bg-[#121212] text-white text-sm p-1 rounded border border-green-500 outline-none"
                                    value={editPlaylistName}
                                    onChange={(e) => setEditPlaylistName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') handleRenamePlaylist(pl.id);
                                        if(e.key === 'Escape') {
                                            setPlaylistIdEditing(null);
                                            setEditPlaylistName('');
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button onClick={() => handleRenamePlaylist(pl.id)} className="text-green-500 hover:text-white p-1"><Save size={16}/></button>
                                <button onClick={() => { setPlaylistIdEditing(null); setEditPlaylistName(''); }} className="text-red-500 hover:text-white p-1"><X size={16}/></button>
                            </div>
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-[#333] flex items-center justify-center rounded shrink-0">
                                    <Music size={16} className="text-gray-400" />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className={`truncate ${(currentView === 'PLAYLIST' && selectedPlaylistId === pl.id) ? 'text-green-500' : 'text-white'}`}>{pl.name}</p>
                                    <p className="text-xs text-gray-500">{t('playlist')}</p>
                                </div>
                                <div className="hidden group-hover:flex items-center bg-[#2a2a2a] absolute right-2 top-1/2 -translate-y-1/2 shadow-lg">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setPlaylistIdEditing(pl.id); setEditPlaylistName(pl.name); }} 
                                        className="p-2 text-gray-400 hover:text-white"
                                        title={t('rename')}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(pl.id); }} 
                                        className="p-2 text-gray-400 hover:text-red-500"
                                        title={t('delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
             </div>
          </div>
        </nav>

        {/* Content Area */}
        <main 
            className={`flex-1 bg-[#121212] md:m-2 md:rounded-lg overflow-y-auto overflow-x-hidden relative transition-all duration-300 ${isNowPlayingOpen ? 'md:mr-[350px]' : ''} ${isQueueOpen && !isNowPlayingOpen ? 'md:mr-[400px]' : ''}`}
        >
           
           {/* Top Bar */}
           <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-sm z-20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2 items-center">
                 <button className="bg-black/50 p-1 rounded-full md:block hidden"><SkipBack size={20} className="rotate-180" /></button> 
                 <button className="bg-black/50 p-1 rounded-full md:block hidden"><SkipForward size={20} /></button>
                 {/* Mobile Logo for Top Bar */}
                 <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center">
                       <Music className="text-white fill-white" size={16} />
                    </div>
                    <span className="font-bold text-white">Light Player</span>
                 </div>

                 {offlineMode && (
                     <div className="ml-2 md:ml-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50">
                         <WifiOff size={14} className="text-red-400" />
                         <span className="text-xs text-red-400 font-bold uppercase tracking-wider hidden md:inline">{t('offlineMode')}</span>
                     </div>
                 )}
              </div>
              
              <div className="flex flex-1 flex-col gap-2 mx-4 w-full md:w-auto">
                  {currentView === 'SEARCH' && (
                      <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
                          <input 
                            type="text" 
                            placeholder={lang === 'en' ? "What do you want to listen to?" : "O que você quer ouvir?"}
                            className="rounded-full bg-[#242424] px-4 py-2 text-sm w-full text-white outline-none focus:ring-2 ring-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                          {/* Search Filters */}
                          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                              <select 
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                                className="bg-[#242424] text-xs text-white px-3 py-1 rounded-full outline-none border border-transparent hover:border-gray-500 appearance-none min-w-[100px]"
                              >
                                  <option value="">{t('allGenres')}</option>
                                  {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                              <select 
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="bg-[#242424] text-xs text-white px-3 py-1 rounded-full outline-none border border-transparent hover:border-gray-500 appearance-none min-w-[80px]"
                              >
                                  <option value="">{t('allYears')}</option>
                                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                              <select 
                                value={filterFormat}
                                onChange={(e) => setFilterFormat(e.target.value)}
                                className="bg-[#242424] text-xs text-white px-3 py-1 rounded-full outline-none border border-transparent hover:border-gray-500 appearance-none min-w-[80px]"
                              >
                                  <option value="">{t('allFormats')}</option>
                                  {availableFormats.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                              {(filterGenre || filterYear || filterFormat) && (
                                  <button 
                                    onClick={() => { setFilterGenre(''); setFilterYear(''); setFilterFormat(''); }}
                                    className="text-xs text-green-500 hover:text-white px-2 whitespace-nowrap"
                                  >
                                      Clear
                                  </button>
                              )}
                          </div>
                      </div>
                  )}
              </div>

              <div className="relative group hidden md:block">
                 <button className="bg-black p-2 rounded-full border border-gray-800 text-gray-400 hover:text-white transition" onClick={() => setCurrentView('SETTINGS')}>
                    <Settings size={20} />
                 </button>
              </div>
           </div>

           {/* Mobile View Padding for Bottom Nav */}
           <div className="p-4 md:p-6 pb-32 md:pb-24 animate-fade-in">
              {currentView === 'HOME' && (
                  <div>
                      <div className="hidden md:flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center shadow-lg">
                              <Music className="text-white fill-white" size={28} />
                           </div>
                           <h1 className="text-4xl font-bold text-white tracking-tight">Light Music Player</h1>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{t('welcome')}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                          <div className="bg-[#282828] hover:bg-[#3E3E3E] transition rounded flex overflow-hidden cursor-pointer group" onClick={() => setCurrentView('LIKED')}>
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center flex-shrink-0">
                                <Heart className="text-white fill-white" size={24} />
                              </div>
                              <div className="flex items-center px-3 md:px-4 font-bold text-white text-sm md:text-base flex-1 relative">
                                {t('likedSongs')}
                                <div className="absolute right-4 bg-green-500 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hidden md:block">
                                   <Play size={20} className="fill-black text-black ml-0.5" />
                                </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-8">
                         <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{t('yourImports')}</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
                            {songs.slice(0, 10).map(song => (
                                <div key={song.id} className="bg-[#181818] p-3 md:p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer group relative">
                                    <div className="w-full aspect-square mb-3 md:mb-4 shadow-lg rounded-md overflow-hidden relative" onClick={() => playSong(song.id)}>
                                        <div className="w-full h-full" style={{ background: generateCover(song.title) }}>
                                            {song.hasCover ? <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 px-1 rounded">{t('hasCover')}</span> : null}
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hidden md:block">
                                            <Play className="fill-black text-black ml-0.5" size={20} />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white truncate pr-0 md:pr-6 text-sm md:text-base">{song.title}</h4>
                                    <p className="text-xs md:text-sm text-gray-400 truncate hover:underline" onClick={(e) => { e.stopPropagation(); goToArtist(song.artist); }}>{song.artist}</p>
                                    
                                    <button 
                                        className="absolute top-2 right-2 p-1 text-white opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-full hover:bg-black/80 hover:scale-110 hidden md:block"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSongToAddToPlaylist(song);
                                        }}
                                        title={t('addToPlaylist')}
                                    >
                                        <ListPlus size={18} />
                                    </button>
                                </div>
                            ))}
                         </div>
                      </div>
                  </div>
              )}

              {(currentView === 'LIBRARY' || currentView === 'SEARCH' || currentView === 'LIKED' || currentView === 'PLAYLIST' || currentView === 'ARTIST' || currentView === 'ALBUM') && (
                  <div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 animate-slide-in-right gap-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                             <div className="self-center md:self-auto shadow-2xl">
                                {currentView === 'LIKED' && (
                                    <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-purple-700 to-blue-500 flex items-center justify-center rounded shadow-lg">
                                        <Heart size={64} className="text-white fill-white" />
                                    </div>
                                )}
                                {(currentView === 'PLAYLIST' || currentView === 'LIBRARY' || currentView === 'SEARCH') && (
                                    <div className="w-40 h-40 md:w-52 md:h-52 bg-[#333] flex items-center justify-center rounded shadow-lg">
                                        <Music size={64} className="text-gray-400" />
                                    </div>
                                )}
                                {(currentView === 'ARTIST' || currentView === 'ALBUM') && (
                                    <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-b from-gray-700 to-black flex items-center justify-center rounded shadow-lg">
                                        {currentView === 'ARTIST' ? <MonitorPlay size={64} className="text-gray-400" /> : <Disc size={64} className="text-gray-400" />}
                                    </div>
                                )}
                             </div>
                             
                             <div className="flex flex-col gap-2 text-center md:text-left">
                                 <p className="text-xs md:text-sm uppercase font-bold text-white tracking-wider">
                                    {currentView === 'LIKED' || currentView === 'PLAYLIST' ? t('playlist') : 
                                     currentView === 'ARTIST' ? t('artistView') :
                                     currentView === 'ALBUM' ? t('albumView') :
                                     t('library')}
                                 </p>
                                 
                                 <div className="flex items-center justify-center md:justify-start gap-2 group">
                                     {isEditingHeader ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                className="text-3xl md:text-6xl font-black text-white bg-transparent border-b border-white outline-none w-full"
                                                value={editHeaderValue}
                                                onChange={(e) => setEditHeaderValue(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') {
                                                        if(currentView === 'ARTIST') handleUpdateArtistName();
                                                        if(currentView === 'ALBUM') handleUpdateAlbumName();
                                                    }
                                                    if(e.key === 'Escape') setIsEditingHeader(false);
                                                }}
                                            />
                                            <button onClick={() => { if(currentView === 'ARTIST') handleUpdateArtistName(); else handleUpdateAlbumName(); }} className="p-2 bg-green-500 rounded-full text-black"><Save size={20}/></button>
                                            <button onClick={() => setIsEditingHeader(false)} className="p-2 bg-red-500 rounded-full text-white"><X size={20}/></button>
                                        </div>
                                     ) : (
                                        <>
                                            <h2 className="text-3xl md:text-6xl font-black text-white">
                                                {currentView === 'SEARCH' ? t('searchResults') : 
                                                currentView === 'LIKED' ? t('likedSongs') : 
                                                currentView === 'PLAYLIST' ? selectedPlaylist?.name : 
                                                currentView === 'ARTIST' ? selectedArtist :
                                                currentView === 'ALBUM' ? selectedAlbum :
                                                t('library')}
                                            </h2>
                                            {(currentView === 'ARTIST' || currentView === 'ALBUM') && (
                                                <button 
                                                    onClick={() => { 
                                                        setIsEditingHeader(true); 
                                                        setEditHeaderValue(currentView === 'ARTIST' ? selectedArtist || '' : selectedAlbum || ''); 
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
                                                >
                                                    <Edit2 size={24} />
                                                </button>
                                            )}
                                        </>
                                     )}
                                 </div>
                                 <p className="text-gray-400 mt-2 font-medium">
                                     {filteredSongs.length} {t('songsInPlaylist')}
                                 </p>
                             </div>
                        </div>
                      </div>

                      <div className="w-full">
                          {/* Desktop Header Row */}
                          <div className="hidden md:grid grid-cols-[16px_1fr_1fr_40px_100px] gap-4 px-4 py-2 border-b border-[#333] text-sm text-gray-400 uppercase tracking-wider mb-2">
                              <span>#</span>
                              <span>{t('title')}</span>
                              <span>{t('album')}</span>
                              <span></span>
                              <span className="flex justify-end"><Clock size={16} /></span>
                          </div>
                          
                          {filteredSongs.map((song, idx) => (
                              <div 
                                key={song.id} 
                                className={`grid md:grid-cols-[16px_1fr_1fr_40px_100px] grid-cols-[1fr_40px] gap-4 px-2 md:px-4 py-2 rounded-md items-center hover:bg-[#2a2a2a] group ${currentSongId === song.id ? 'text-green-500' : ''}`}
                                onDoubleClick={() => playSong(song.id)}
                                onClick={() => window.innerWidth < 768 && playSong(song.id)}
                              >
                                  {/* Desktop Index */}
                                  <span className="text-sm justify-center w-4 hidden md:flex">
                                      {currentSongId === song.id && isPlaying ? (
                                         <div className="w-3 h-3 bg-green-500 animate-pulse rounded-full" />
                                      ) : (
                                          <span className="group-hover:hidden">{idx + 1}</span>
                                      )}
                                      <Play size={14} className="hidden group-hover:block text-white cursor-pointer fill-white" onClick={() => playSong(song.id)} />
                                  </span>

                                  {/* Mobile/Desktop Content */}
                                  <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="w-10 h-10 flex-shrink-0 bg-gray-700 rounded relative group/img overflow-hidden">
                                          {song.hasCover ? (
                                              <div className="w-full h-full bg-cover" style={{ backgroundImage: `url(${generateCover(song.title)})` }}></div>
                                          ) : (
                                              <div className="w-full h-full" style={{ background: generateCover(song.title) }}></div>
                                          )}
                                      </div>
                                      <div className="flex flex-col truncate">
                                          <span className={`font-medium truncate ${currentSongId === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                          <div className="flex items-center gap-2">
                                              <span 
                                                className="text-sm text-gray-400 truncate hover:text-white hover:underline cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); goToArtist(song.artist); }}
                                              >
                                                  {song.artist}
                                              </span>
                                              {/* Tiny badge for format/genre if available */}
                                              {song.format && <span className="text-[10px] bg-gray-700 px-1 rounded text-gray-300 hidden md:inline-block">{song.format}</span>}
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Album (Desktop Only) */}
                                  <div className="hidden md:flex flex-col truncate">
                                    <span 
                                        className="text-sm truncate text-gray-400 hover:text-white hover:underline cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); goToAlbum(song.album); }}
                                    >
                                        {song.album}
                                    </span>
                                    {song.year && <span className="text-xs text-gray-500">{song.year}</span>}
                                  </div>
                                  
                                  {/* Actions */}
                                  <span className="flex items-center justify-end gap-2 md:gap-4">
                                      <button onClick={(e) => { e.stopPropagation(); handleToggleLike(song.id); }} title={t('likedSongs')}>
                                          <Heart size={16} className={likedSongs.has(song.id) ? "text-green-500 fill-green-500" : "text-gray-400 hover:text-white"} />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); setEditingSong(song); }} title={t('editInfo')} className="hidden md:block">
                                          <Edit2 size={16} className="text-gray-400 hover:text-white" />
                                      </button>
                                  </span>
                                  
                                  {/* Duration (Desktop) */}
                                  <span className="text-sm text-gray-400 text-right hidden md:block">{formatTime(song.duration)}</span>
                              </div>
                          ))}
                          {filteredSongs.length === 0 && (
                             <div className="text-center py-20 text-gray-500">
                                 <p className="mb-4">{t('noSongs')}</p>
                                 {currentView === 'SEARCH' && <button onClick={() => setCurrentView('HOME')} className="text-white font-bold underline">{t('goBack')}</button>}
                             </div>
                          )}
                      </div>
                  </div>
              )}

              {currentView === 'SETTINGS' && (
                  <div className="max-w-4xl mx-auto animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6">{t('settings')}</h2>
                      
                      {/* Library Statistics */}
                      <div className="bg-[#181818] p-6 rounded-lg mb-6">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <BarChart2 size={20} className="text-green-500"/> 
                             {t('statistics')}
                          </h3>
                          <div className="flex gap-12">
                              <div>
                                  <p className="text-4xl font-bold text-white">{songs.length}</p>
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{t('songs')}</p>
                              </div>
                              <div>
                                  <p className="text-4xl font-bold text-white">{playlists.length}</p>
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{t('playlists')}</p>
                              </div>
                          </div>
                      </div>

                      {/* Offline Mode */}
                      <div className="bg-[#181818] p-6 rounded-lg mb-6">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             {offlineMode ? <WifiOff size={20} className="text-red-500"/> : <Wifi size={20} className="text-green-500"/>}
                             {t('offlineMode')}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">{t('offlineModeDesc')}</p>
                          
                          <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                              <span className="font-bold text-white">
                                  {offlineMode ? t('offlineEnabled') : t('offlineDisabled')}
                              </span>
                              <button 
                                onClick={toggleOfflineMode}
                                className={`w-12 h-6 rounded-full relative transition-colors ${offlineMode ? 'bg-red-500' : 'bg-green-500'}`}
                              >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${offlineMode ? 'left-7' : 'left-1'}`}></div>
                              </button>
                          </div>
                      </div>

                      {/* Discord Integration Settings */}
                      <div className={`bg-[#181818] p-6 rounded-lg mb-6 transition-opacity ${offlineMode ? 'opacity-50 pointer-events-none' : ''}`}>
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Gamepad2 size={20} className="text-[#5865F2]"/> 
                             {t('discordRpc')}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">{t('discordRpcDesc')}</p>
                          
                          <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                              <span className="font-bold text-white">
                                  {discordRpcEnabled ? t('discordRpcEnabled') : t('discordRpcDisabled')}
                              </span>
                              <button 
                                onClick={toggleDiscordRpc}
                                className={`w-12 h-6 rounded-full relative transition-colors ${discordRpcEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                              >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${discordRpcEnabled ? 'left-7' : 'left-1'}`}></div>
                              </button>
                          </div>
                      </div>

                      {/* Customize Background */}
                      <div className="bg-[#181818] p-6 rounded-lg mb-6">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ImageIcon size={20}/> {t('customizeBg')}</h3>
                          
                          <div className="mb-6 border-b border-gray-700 pb-6">
                              <label className="text-gray-300 text-sm font-bold mb-2 block">{t('bgMode')}</label>
                              <div className="flex gap-4">
                                  <button 
                                    onClick={() => { setNowPlayingBgMode('cover'); localStorage.setItem('lmp_now_playing_bg_mode', 'cover'); }}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${nowPlayingBgMode === 'cover' ? 'bg-green-500 text-black' : 'bg-[#333] text-white'}`}
                                  >
                                      {t('bgModeCover')}
                                  </button>
                                  <button 
                                    onClick={() => { setNowPlayingBgMode('custom'); localStorage.setItem('lmp_now_playing_bg_mode', 'custom'); }}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${nowPlayingBgMode === 'custom' ? 'bg-green-500 text-black' : 'bg-[#333] text-white'}`}
                                  >
                                      {t('bgModeCustom')}
                                  </button>
                              </div>
                          </div>

                          <p className="text-gray-400 text-sm mb-4">Set a custom GIF/Image for the "Now Playing" sidebar (when Custom mode is selected).</p>
                          
                          <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-4">
                                  <label className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm cursor-pointer transition">
                                      {t('importGif')}
                                      <input type="file" accept="image/gif, image/jpeg, image/png" className="hidden" onChange={handleBgImport} />
                                  </label>
                                  <span className="text-gray-500 text-sm">OR</span>
                                  <div className="flex-1 flex gap-2">
                                      <input 
                                          type="text" 
                                          placeholder={t('gifUrl')} 
                                          value={tempGifUrl} 
                                          onChange={(e) => setTempGifUrl(e.target.value)}
                                          className="flex-1 bg-black text-white p-2 rounded text-sm outline-none border border-gray-700 focus:border-green-500"
                                      />
                                      <button onClick={handleSetBgUrl} className="bg-green-500 text-black px-4 py-2 rounded text-sm font-bold hover:scale-105 transition">{t('setBg')}</button>
                                  </div>
                              </div>
                              {nowPlayingBg && (
                                  <div className="flex items-center gap-4">
                                      <div className="w-24 h-16 rounded overflow-hidden border border-gray-600 relative group">
                                          <img src={nowPlayingBg} className="w-full h-full object-cover" />
                                      </div>
                                      <button 
                                          onClick={() => { setNowPlayingBg(''); localStorage.removeItem('lmp_now_playing_bg'); }}
                                          className="text-red-400 text-sm hover:underline"
                                      >
                                          {t('resetBg')}
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Language */}
                      <div className="bg-[#181818] p-6 rounded-lg mb-6 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Globe className="text-gray-400" />
                              <span className="font-bold text-white">{t('language')}</span>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => changeLanguage('en')} 
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${lang === 'en' ? 'bg-white text-black' : 'bg-[#333] text-white'}`}
                              >
                                  English
                              </button>
                              <button 
                                onClick={() => changeLanguage('pt')} 
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${lang === 'pt' ? 'bg-white text-black' : 'bg-[#333] text-white'}`}
                              >
                                  Português
                              </button>
                          </div>
                      </div>

                      <Equalizer settings={eqSettings} onUpdate={setEqSettings} />
                  </div>
              )}
           </div>
        </main>
      </div>

      {/* Mobile Elements */}
      <MiniPlayerMobile />
      <MobileBottomNav />
      {/* Desktop Footer */}
      <DesktopFooter />

    </div>
  );
};

export default App;