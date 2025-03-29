import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';

const SkeletonLoader = () => {
  const opacity = new Animated.Value(1);

  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]),
  ).start();

  return (
    <Animated.View style={[styles.container, {opacity}]}>
      <View style={styles.image} />
      <View style={styles.content}>
        <View style={styles.title} />
        <View style={styles.description} />
        <View style={styles.footer} />
      </View>
    </Animated.View>
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
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 15,
  },
  title: {
    height: 20,
    width: '80%',
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    borderRadius: 4,
  },
  description: {
    height: 16,
    width: '100%',
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    borderRadius: 4,
  },
  footer: {
    height: 12,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default SkeletonLoader;
