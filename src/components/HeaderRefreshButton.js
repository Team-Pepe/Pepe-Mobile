import React, { useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export const HeaderRefreshButton = ({ onPress, style }) => {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const handlePress = () => {
    spin.setValue(0);
    scale.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(spin, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    onPress && onPress();
  };
  return (
    <TouchableOpacity style={[{ marginRight: 15 }, style]} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
        <FontAwesome5 name="redo" size={18} color="#007AFF" />
      </Animated.View>
    </TouchableOpacity>
  );
};