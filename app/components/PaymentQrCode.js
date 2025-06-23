import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const PaymentQrCode = ({
  value,
  size = 220,
  logo = null,
  logoSize = 64, // Increased from 48
  logoBackgroundColor = '#fff'
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=0`;

  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        <Image
          source={{ uri: qrUrl }}
          style={styles.qrImage}
          resizeMode="contain"
        />
        {logo && (
          <View style={[
            styles.logoContainer,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
              backgroundColor: logoBackgroundColor,
              left: size / 2 - logoSize / 2,
              top: size / 2 - logoSize / 2,
            }
          ]}>
            <Image
              source={logo}
              style={{
                width: logoSize * 0.85, // Slightly larger content ratio
                height: logoSize * 0.85,
                borderRadius: (logoSize * 0.85) / 2,
              }}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentQrCode;
