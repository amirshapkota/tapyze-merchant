import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';

import styles from '../styles/WelcomeScreenStyles';
const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to TAPYZE for Business',
    description: 'Your complete merchant solution for accepting contactless payments',
    image: require('../assets/logo.png'),
  },
  {
    id: '2',
    title: 'Accept Payments Anywhere',
    description: 'Turn your device into a payment terminal and accept NFC payments on the go',
    image: require('../assets/tap-pay.png'),
  },
  {
    id: '3',
    title: 'Track Sales & Analytics',
    description: 'Monitor your business performance with real-time transaction data and insights',
    image: require('../assets/analytics.png'),
  },
];

const WelcomeScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentSlideIndex + 1 });
    } else {
      navigation.navigate('Auth');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Auth');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageWrapper}>
          <Image 
            source={item.image} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <View style={styles.header}>
        
        {currentSlideIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />
      
      <View style={styles.footer}>
        {/* Pagination */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  { width: dotWidth, opacity, backgroundColor: '#ed7b0e' }
                ]}
              />
            );
          })}
        </View>
        
        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentSlideIndex < slides.length - 1 ? 'Next' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;