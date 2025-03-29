import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ArticleDetailScreen = ({route, navigation}) => {
  const {article, isLiked, isBookmarked, onLike, onBookmark} = route.params;

  const handleOpenURL = () => {
    if (article.url) {
      Linking.openURL(article.url).catch(err => {
        Alert.alert('Error', 'Could not open the article');
      });
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onLike}>
            <MaterialIcons
              name={isLiked ? 'favorite' : 'favorite-border'}
              size={24}
              color={isLiked ? '#ff4081' : '#000'}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookmark}>
            <MaterialIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={isBookmarked ? '#3f51b5' : '#000'}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isLiked, isBookmarked, onLike, onBookmark]);

  return (
    <ScrollView style={styles.container}>
      {article.urlToImage && (
        <Image source={{uri: article.urlToImage}} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.source}>{article.source?.name}</Text>
          <Text style={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.contentText}>
          {article.content || article.description}
        </Text>

        {article.author && (
          <Text style={styles.author}>By {article.author}</Text>
        )}

        <TouchableOpacity style={styles.readMoreButton} onPress={handleOpenURL}>
          <Text style={styles.readMoreText}>Read Full Article</Text>
          <MaterialIcons name="open-in-new" size={16} color="#3f51b5" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    height: 250,
    width: '100%',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  source: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  readMoreText: {
    color: '#3f51b5',
    fontSize: 16,
    marginRight: 5,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 15,
  },
  headerIcon: {
    marginLeft: 15,
  },
});

export default ArticleDetailScreen;
