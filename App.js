import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

import { db } from "./firebaseConfig";
import { ref, set } from "firebase/database";

export default function App() {

  const [isTrial, setIsTrial] = useState(false)
  const [accData, setAccData] = useState([]);
  const [gyroData, setGyroData] = useState([]);

  const [isOver, setIsOver] = useState(false)

  const [subscriptionAcc, setSubscriptionAcc] = useState(null);
  const [subscriptionGyro, setSubscriptionGyro] = useState(null);

  var initialTimeAcc = 0;
  var initialTimeGyro = 0;

  const unsubscribe = () => {
    try {
      subscriptionAcc && subscriptionAcc.remove();
      subscriptionGyro && subscriptionGyro.remove();
      setSubscriptionAcc(null);
      setSubscriptionGyro(null);
    } catch (error) {
      console.error("Error during unsubscribe:", error);
    }
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    Gyroscope.setUpdateInterval(200);

    if (isTrial) {
      setSubscriptionAcc(Accelerometer.addListener(({ x, y, z }) => {
        var currentTime = Date.now();
        if (initialTimeAcc === 0) {
          initialTimeAcc = currentTime;
        }
        currentTime = ((currentTime - initialTimeAcc) / 1000).toFixed(2);
        setAccData(prevData => [...prevData, { x, y, z, currentTime }]);
      }));

      setSubscriptionGyro(Gyroscope.addListener(({ x, y, z }) => {
        var currentTime = Date.now();
        if (initialTimeGyro === 0) {
          initialTimeGyro = currentTime;
        }
        currentTime = ((currentTime - initialTimeGyro) / 1000).toFixed(2);
        setGyroData(prevData => [...prevData, { x, y, z, currentTime }]);
      }));
    } else {
      unsubscribe();
    }
  }, [isTrial]);


  const handleTrial = () => {
    setIsOver(false)
    setIsTrial(true)

    setTimeout(() => {
      setIsTrial(false)
      set(ref(db, 'sensors/'), {
        accelerometer: accData,
        gyroscope: gyroData
      });
      initialTimeAcc = 0
      initialTimeGyro = 0
      setIsOver(true)
    }, 10000);
  }

  return (
    <View style={styles.container}>
      <Button title="Get Accelerometer data" onPress={handleTrial} />
      {isOver ? <Text>TRIAL IS OVER!</Text> : null}
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
