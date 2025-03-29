import axios from 'axios';

const API_KEY = 'f14d6885ebf24530a2a6ea24aaae287c';

export const fetchArticles = async (page = 1, searchQuery = '') => {
  try {
    let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
    if (searchQuery) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        searchQuery,
      )}&apiKey=${API_KEY}`;
    }

    const response = await axios.get(`${url}&page=${page}`);

    if (response.data.status === 'ok') {
      return {
        articles: response.data.articles.map(article => ({
          ...article,
          id: `${article.publishedAt}-${article.title}`.replace(/\s+/g, '-'),
        })),
        totalResults: response.data.totalResults,
      };
    }
    throw new Error('Failed to fetch articles');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
