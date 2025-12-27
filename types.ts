export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  fileBlob: Blob; // Stored in IndexedDB
  coverBlob?: Blob | null;
  addedAt: number;
  playlistIds?: string[];
  genre?: string;
  year?: string;
  format?: string;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  hasCover: boolean;
  playlistIds?: string[];
  genre?: string;
  year?: string;
  format?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[]; // Keep for reference, though song object links back too
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  stats: {
    songsImported: number;
    playlistsCreated: number;
    minutesListened: number;
  };
}

export interface EQBand {
  frequency: number;
  gain: number; // -12 to 12
  type: 'lowshelf' | 'peaking' | 'highshelf';
}

export interface EQSettings {
  enabled: boolean;
  bands: EQBand[];
  presetName: string;
}

export type View = 'HOME' | 'SEARCH' | 'LIBRARY' | 'LIKED' | 'SETTINGS' | 'LOGIN' | 'PLAYLIST' | 'ARTIST' | 'ALBUM';

export type Language = 'en' | 'pt';