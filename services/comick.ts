import { Manga } from '../types';

const API_URL = 'https://api.comick.io/v1.0';

export const searchManga = async (query: string): Promise<Manga[]> => {
  try {
    // Filter by country=kr (Manhwa) and type=comic
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&type=comic&country=kr&limit=20`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // The API returns an array directly
    return data.map((item: any) => mapComickToManga(item));
  } catch (error) {
    console.error('Comick Search Error:', error);
    return [];
  }
};

export const getTrendingManhwa = async (page: number = 1): Promise<Manga[]> => {
  try {
    // Fetch trending manhwa
    const response = await fetch(`${API_URL}/top?type=trending&comic_types=manhwa&page=${page}&limit=20&accept_mature_content=false`);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    
    // "rank" contains the list for the top endpoint
    return data.rank ? data.rank.map((item: any) => mapComickToManga(item)) : [];
  } catch (error) {
    console.error('Comick Trending Error:', error);
    return [];
  }
};

const mapComickToManga = (item: any): Manga => {
  // Handle differences between search results and detail results
  const hid = item.hid;
  const title = item.title;
  
  // Cover logic: Comick stores covers on 'meo.comick.pictures'
  // Search results usually have 'md_covers' array.
  let coverKey = '';
  if (item.md_covers && item.md_covers.length > 0) {
    coverKey = item.md_covers[0].b2key;
  } else if (item.cover_url) {
    // sometimes provided directly
    coverKey = item.cover_url;
  }

  const coverUrl = coverKey 
    ? `https://meo.comick.pictures/${coverKey}` 
    : 'https://picsum.photos/300/450';

  // Status mapping: 1 = Ongoing, 2 = Completed
  const statusMap: { [key: number]: string } = {
    1: 'Ongoing',
    2: 'Completed',
    3: 'Cancelled',
    4: 'Hiatus'
  };

  // Chapter count: 'last_chapter' is a string in the API, e.g. "150.5"
  const chapterCount = item.last_chapter ? parseFloat(item.last_chapter) : null;

  return {
    id: hid,
    title: {
      romaji: title,
      english: title, // Comick usually just provides one main title
      userPreferred: title
    },
    coverImage: {
      large: coverUrl,
      extraLarge: coverUrl
    },
    description: item.desc || 'No description available.',
    status: statusMap[item.status] || 'Unknown',
    chapters: chapterCount, // This is the "Latest Chapter"
    averageScore: item.rating ? parseFloat(item.rating) * 10 : null, // Convert 1-10 to percentage
    genres: item.md_genres ? item.md_genres.map((g: any) => g.name) : []
  };
};