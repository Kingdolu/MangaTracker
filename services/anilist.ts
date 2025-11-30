import { ANILIST_API_URL } from '../constants';
import { Manga } from '../types';

const SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 20) {
    media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
      id
      title {
        romaji
        english
        userPreferred
      }
      coverImage {
        large
        extraLarge
      }
      description
      status
      chapters
      averageScore
      genres
    }
  }
}
`;

const TRENDING_QUERY = `
query ($page: Int) {
  Page(page: $page, perPage: 20) {
    media(type: MANGA, sort: TRENDING_DESC, countryOfOrigin: "KR") {
      id
      title {
        romaji
        english
        userPreferred
      }
      coverImage {
        large
        extraLarge
      }
      description
      status
      chapters
      averageScore
      genres
    }
  }
}
`;

export const searchManga = async (query: string): Promise<Manga[]> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search: query },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching manga:', error);
    return [];
  }
};

export const getTrendingManhwa = async (page: number = 1): Promise<Manga[]> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: { page },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};