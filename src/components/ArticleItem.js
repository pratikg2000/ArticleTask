import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Swipeable} from 'react-native-gesture-handler';

const ArticleItem = ({
  article,
  onPress,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  renderRightActions,
}) => {
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        {article.urlToImage && (
          <Image source={{uri: article.urlToImage}} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {article.description || 'No description available'}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.source}>{article.source?.name}</Text>
            <Text style={styles.date}>
              {new Date(article.publishedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.icons}>
            {liked && (
              <Icon
                name="favorite"
                size={16}
                color="#ff4081"
                style={styles.icon}
              />
            )}
            {bookmarked && (
              <Icon
                name="bookmark"
                size={16}
                color="#3f51b5"
                style={styles.icon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    height: 200,
    width: '100%',
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  source: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  icons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  icon: {
    marginRight: 10,
  },
});

export default ArticleItem;
