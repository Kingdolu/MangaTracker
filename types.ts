export enum ReadingStatus {
  WANT_TO_READ = 'Want to Read',
  READING = 'Reading',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

export interface MangaTitle {
  romaji: string;
  english: string | null;
  userPreferred: string;
}

export interface MangaCover {
  large: string;
  extraLarge: string;
}

export interface Manga {
  id: number;
  title: MangaTitle;
  coverImage: MangaCover;
  description: string;
  status: string;
  chapters: number | null;
  averageScore: number | null;
  genres: string[];
  countryOfOrigin: string;
}

export interface LibraryItem extends Manga {
  readingStatus: ReadingStatus;
  savedAt: number;
}

export interface RecommendedManga extends Manga {
  recommendationReason: string;
}