import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {fetchArticles} from '../utils/api';
import {
  cacheArticles,
  getCachedArticles,
  getSavedArticles,
  toggleSavedArticle,
} from '../utils/storage';
import ArticleItem from '../components/ArticleItem';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [likedArticles, setLikedArticles] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [searching, setSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const searchTimeoutRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const saved = await getSavedArticles();
      setLikedArticles(saved.likedArticles);
      setBookmarkedArticles(saved.bookmarkedArticles);
    } catch (err) {
      console.error('Error loading saved articles:', err);
    }
  }, []);

  const fetchData = useCallback(
    async (pageNum = 1, isRefreshing = false) => {
      try {
        if (pageNum === 1 && !isRefreshing) {
          setLoading(true);
          setShowSkeleton(true);
          setInitialLoad(true);
        }

        setError(null);
        setIsOffline(false);

        const {articles: newArticles, totalResults: newTotalResults} =
          await fetchArticles(pageNum, searchQuery);

        setTotalResults(newTotalResults);

        if (pageNum === 1) {
          setArticles(newArticles);
          await cacheArticles(newArticles);
          setTimeout(() => setShowSkeleton(false), 1000);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
        }

        setPage(pageNum);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
        setShowSkeleton(false);

        if (err.message.includes('Network Error')) {
          setIsOffline(true);
          const cachedData = await getCachedArticles();
          if (cachedData) {
            const filteredData = searchQuery
              ? cachedData.filter(
                  article =>
                    article.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    article.description
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
              : cachedData;
            setArticles(filteredData);
            setTimeout(() => setShowSkeleton(false), 1000);
          } else {
            setError('No internet connection and no cached data available');
          }
        } else {
          setError('Failed to fetch news articles');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSearching(false);
        setInitialLoad(false);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    loadData();
    fetchData();
  }, [loadData]);

  const handleSearchTextChange = text => {
    setSearchQuery(text);
    setSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setShowSkeleton(true);
      fetchData(1);
    }, 500);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && articles.length < totalResults && !initialLoad) {
      fetchData(page + 1);
    }
  };

  const handleArticlePress = article => {
    navigation.navigate('ArticleDetail', {
      article,
      isLiked: likedArticles.includes(article.id),
      isBookmarked: bookmarkedArticles.includes(article.id),
      onLike: () => handleLike(article.id),
      onBookmark: () => handleBookmark(article.id),
    });
  };

  const handleLike = async articleId => {
    const updatedLikes = await toggleSavedArticle(
      'likedArticles',
      articleId,
      likedArticles,
    );
    setLikedArticles(updatedLikes);
  };

  const handleBookmark = async articleId => {
    const updatedBookmarks = await toggleSavedArticle(
      'bookmarkedArticles',
      articleId,
      bookmarkedArticles,
    );
    setBookmarkedArticles(updatedBookmarks);
  };

  const renderRightActions = (progress, dragX, articleId) => {
    const isLiked = likedArticles.includes(articleId);
    const isBookmarked = bookmarkedArticles.includes(articleId);

    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.likeAction]}
          onPress={() => handleLike(articleId)}>
          <MaterialIcons
            name={isLiked ? 'favorite' : 'favorite-border'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.bookmarkAction]}
          onPress={() => handleBookmark(articleId)}>
          <MaterialIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({item}) => (
    <ArticleItem
      article={item}
      onPress={() => handleArticlePress(item)}
      liked={likedArticles.includes(item.id)}
      bookmarked={bookmarkedArticles.includes(item.id)}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item.id)
      }
    />
  );

  const renderFooter = () => {
    if (!loading || initialLoad) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  if (loading && initialLoad && !showSkeleton) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={50} color="#ff0000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchData()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="signal-wifi-off" size={20} color="#fff" />
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchTextChange}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          setPage(1);
          setShowSkeleton(true);
          fetchData(1);
        }}
        loading={searching}
      />

      {articles.length === 0 && !showSkeleton && !loading ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={50} color="#888" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'No matching articles found'
              : 'No articles available'}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => {
                setSearchQuery('');
                setPage(1);
                setShowSkeleton(true);
                fetchData(1);
              }}>
              <Text style={styles.clearSearchText}>Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={showSkeleton ? Array(5).fill({}) : articles}
          renderItem={showSkeleton ? () => <SkeletonLoader /> : renderItem}
          keyExtractor={(item, index) =>
            showSkeleton ? `skeleton-${index}` : item.id
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#3f51b5',
    borderRadius: 5,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    margin: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0000ff',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#ff5722',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  swipeActionsContainer: {
    width: 120,
    flexDirection: 'row',
  },
  swipeAction: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeAction: {
    backgroundColor: '#ff4081',
  },
  bookmarkAction: {
    backgroundColor: '#3f51b5',
  },
});

export default HomeScreen;
