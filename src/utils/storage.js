import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'cachedArticles';
const LIKED_ARTICLES_KEY = 'likedArticles';
const BOOKMARKED_ARTICLES_KEY = 'bookmarkedArticles';

export const cacheArticles = async articles => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error('Error caching articles:', error);
  }
};

export const getCachedArticles = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached articles:', error);
    return null;
  }
};

export const getSavedArticles = async () => {
  try {
    const [liked, bookmarked] = await Promise.all([
      AsyncStorage.getItem(LIKED_ARTICLES_KEY),
      AsyncStorage.getItem(BOOKMARKED_ARTICLES_KEY),
    ]);
    return {
      likedArticles: liked ? JSON.parse(liked) : [],
      bookmarkedArticles: bookmarked ? JSON.parse(bookmarked) : [],
    };
  } catch (error) {
    console.error('Error getting saved articles:', error);
    return {likedArticles: [], bookmarkedArticles: []};
  }
};

export const toggleSavedArticle = async (key, articleId, currentList) => {
  try {
    let updatedList;
    if (currentList.includes(articleId)) {
      updatedList = currentList.filter(id => id !== articleId);
    } else {
      updatedList = [...currentList, articleId];
    }
    await AsyncStorage.setItem(key, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error(`Error toggling ${key}:`, error);
    return currentList;
  }
};
