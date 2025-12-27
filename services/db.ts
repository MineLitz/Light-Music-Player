import { Song, Playlist, SongMetadata } from '../types';

const DB_NAME = 'LightMusicPlayerDB';
const DB_VERSION = 2; // Incremented for schema changes if needed, though mostly logic based

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject("IndexedDB error: " + (event.target as any).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('songs')) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' });
        songStore.createIndex('title', 'title', { unique: false });
        songStore.createIndex('artist', 'artist', { unique: false });
      }

      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
    };
  });
};

export const addSongToDB = async (song: Song): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');
    const request = store.put(song);
    request.onsuccess = () => resolve();
    request.onerror = () => reject();
  });
};

export const getSongBlob = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readonly');
    const store = transaction.objectStore('songs');
    const request = store.get(id);
    request.onsuccess = () => {
      const song = request.result as Song;
      resolve(song?.fileBlob);
    };
    request.onerror = () => reject();
  });
};

export const getAllSongsMetadata = async (): Promise<SongMetadata[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readonly');
    const store = transaction.objectStore('songs');
    const request = store.getAll();
    request.onsuccess = () => {
      const songs = request.result as Song[];
      // Return lightweight metadata only to save memory
      const metadata = songs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration,
        hasCover: !!s.coverBlob,
        playlistIds: s.playlistIds || [],
        genre: s.genre,
        year: s.year,
        format: s.format
      }));
      resolve(metadata);
    };
    request.onerror = () => reject();
  });
};

export const updateSongMetadata = async (id: string, updates: Partial<Song>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const song = getRequest.result as Song;
      if (song) {
        // Merge updates
        const updatedSong = { ...song, ...updates };
        const putRequest = store.put(updatedSong);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject("Failed to update song");
      } else {
        reject('Song not found');
      }
    };
    getRequest.onerror = () => reject("Error fetching song");
  });
};

export const updateSongCover = async (id: string, coverBlob: Blob): Promise<void> => {
    return updateSongMetadata(id, { coverBlob });
};

export const getSongWithCover = async (id: string): Promise<Song | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readonly');
    const store = transaction.objectStore('songs');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject();
  });
};

// --- Playlist Functions ---

export const createPlaylistDB = async (name: string): Promise<Playlist> => {
    const db = await initDB();
    const playlist: Playlist = {
        id: crypto.randomUUID(),
        name,
        songIds: [],
        createdAt: Date.now()
    };
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['playlists'], 'readwrite');
        const store = transaction.objectStore('playlists');
        const request = store.put(playlist);
        request.onsuccess = () => resolve(playlist);
        request.onerror = () => reject();
    });
};

export const getAllPlaylistsDB = async (): Promise<Playlist[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['playlists'], 'readonly');
        const store = transaction.objectStore('playlists');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Playlist[]);
        request.onerror = () => reject();
    });
};

export const updatePlaylist = async (id: string, updates: Partial<Playlist>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const playlist = getRequest.result as Playlist;
      if (playlist) {
        const updated = { ...playlist, ...updates };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject("Failed to update playlist");
      } else {
        reject('Playlist not found');
      }
    };
    getRequest.onerror = () => reject();
  });
};

export const deletePlaylist = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject();
  });
};