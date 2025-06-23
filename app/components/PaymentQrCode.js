import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const PaymentQrCode = ({ 
  value, 
  size = 220, 
  logo = null, 
  logoSize = 44,
  logoBackgroundColor = '#FFFFFF' 
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=10`;
  
  return (
    <View style={[styles.container, { width: size + 20, height: size + 20 }]}>
      <Image
        source={{ uri: qrUrl }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {/* Logo overlay - only show if logo is provided */}
      {logo && (
        <View style={[
          styles.logoContainer, 
          { 
            width: logoSize, 
            height: logoSize, 
            borderRadius: logoSize / 2,
            backgroundColor: logoBackgroundColor 
          }
        ]}>
          <Image
            source={logo}
            style={[styles.logoImage, { width: logoSize - 12, height: logoSize - 12 }]}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  logoImage: {
    borderRadius: 16,
  },
});

export default PaymentQrCode;