import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';


export default function Results() {

  return (
    <View style={styles.container}>
      <Text>Results</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
