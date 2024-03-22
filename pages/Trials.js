import { StyleSheet, View, Modal, Pressable, Vibration, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import moment from 'moment';
import { db } from "../firebaseConfig";
import { ref, set, onValue } from "firebase/database";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ApplicationProvider, Text, Layout, Button, Divider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  FadeOut,
  FadeInDown,
  withSequence
} from 'react-native-reanimated';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';

import Sensors from '../Sensors';


var accData = []
var gyroData = []

function SingleTask() {
  const [isTrial, setIsTrial] = useState(false);
  const [trialStart, setTrialStart] = useState(false);
  const [beforeWalk, setBeforeWalk] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [trialStopped, setTrialStopped] = useState(false);


  const [trial, setTrial] = useState(null)

  const timeoutIdRef = useRef(null);

  var initialTimeAcc = 0;
  var initialTimeGyro = 0;

  Accelerometer.setUpdateInterval(50);
  Gyroscope.setUpdateInterval(50);

  // Animations
  const defaultAnim = useSharedValue(50);

  const animatedDefault = useAnimatedStyle(() => ({
    transform: [{ translateX: defaultAnim.value }],
  }));

  const fadeInOpacity = useSharedValue(0);

  const fadeIn = () => {
    fadeInOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1000, easing: Easing.elastic }), withTiming(0)),
      -1
    );
  };

  useEffect(() => {
    fadeIn();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeInOpacity.value || 0,
    };
  });


  useEffect(() => {
    defaultAnim.value = withRepeat(
      withTiming(-(defaultAnim.value / 2), {
        duration: 1000,
        easing: Easing.steps(4, true),
      }),
      -1,
      true
    );
  }, []);

  // ----------

  useEffect(() => {
    const dataRef = ref(db, 'Patients/rita/sensor_trials/single_task');

    const fetchData = onValue(dataRef, (snapshot) => {
      const trials = []
      const keys = Object.keys(snapshot.val())
      keys.map((key) => {
        trials.push(key.split("_")[1])
      })
      setTrial(parseInt(Math.max(...trials)))
    });

    return () => fetchData();
  }, []);


  useEffect(() => {
    if (isTrial) {
      const accListener = Accelerometer.addListener(({ x, y, z }) => {
        var currentTime = Date.now();
        if (initialTimeAcc === 0) {
          initialTimeAcc = currentTime;
        }
        currentTime = ((currentTime - initialTimeAcc) / 1000).toFixed(2);

        accData.push({ x: x * 9.8, y: y * 9.8, z: z * 9.8, currentTime })
      });
      return () => {
        accListener.remove();
      };
    }
  }, [isTrial]);


  useEffect(() => {
    if (isTrial) {
      const gyroListener = Gyroscope.addListener(({ x, y, z }) => {
        var currentTime = Date.now();
        if (initialTimeGyro === 0) {
          initialTimeGyro = currentTime;
        }
        currentTime = ((currentTime - initialTimeGyro) / 1000).toFixed(2);

        gyroData.push({ x: x, y: y, z: z, currentTime })
      });
      return () => {
        gyroListener.remove();
      };
    }
  }, [isTrial]);


  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);


  const sendData = async () => {
    await Sensors(accData).then((data) => {
      set(ref(db, 'Patients/' + "rita" + `/sensor_trials/single_task/Trial_${trial + 1}/`), {
        time: moment().format('MMMM Do YYYY, h:mm:ss a'),
        accelerometer: accData,
        gyroscope: gyroData,
        steps: data.steps,
        AMW: data.filteredEnergy
      }).then(() => {
        accData = []
        gyroData = []
        initialTimeAcc = 0
        initialTimeGyro = 0
      });
    })

  }


  async function handleStartTrial() {
    setBeforeWalk(true)

    setTimeout(() => {
      Vibration.vibrate(1000)

      setTimeout(() => {
        setIsTrial(true)

        const id = setTimeout(() => {
          setIsTrial(false);
          setTrialStart(false)
          setBeforeWalk(false)
          setModalVisible(!modalVisible);
          sendData();
        }, 10000);

        timeoutIdRef.current = id;
      }, 1500)

    }, 5000)
  }


  async function stopTrial() {
    setTrialStart(false)
    setIsTrial(false)
    setBeforeWalk(false)

    setTrialStopped(!trialStopped)

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
      accData = []
      gyroData = []
      initialTimeAcc = 0
      initialTimeGyro = 0
    }
  }

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={styles.container}
        level='2'
      >
        {!trialStart ?
          (<>
            <View flexDirection="row" justifyContent="center" alignItems="flex-end" style={{ marginTop: 150, marginBottom: 20 }}>
              <Icon name='directions-walk' size={200} color="#808080" fill='#8F9BB3' />
              <Icon name='timer' style={{ marginLeft: -65 }} size={100} color="#e9e9e9" fill='#8F9BB3' />
            </View>
            <Text style={{ textAlign: "center" }}>Press to start the trial!</Text>
            <Button style={{ marginTop: 70, marginLeft: 100, marginBottom: 170, elevation: 2, width: 200, height: 80, backgroundColor: "#8bae1d", borderWidth: 0, justifyContent: 'center' }} onPress={() => setTrialStart(true)}>
              <Text style={{ fontSize: 100, color: 'white' }}>Start Trial</Text>
            </Button>
          </>) : (
            <>
              {!beforeWalk && !isTrial ?
                <View flexDirection="row" justifyContent="center" alignItems="flex-end" style={{ marginTop: 80, marginBottom: 10 }}>
                  <CircularProgressBase
                    value={0}
                    radius={150}
                    maxValue={10}
                    initialValue={10}
                    progressValueColor={'#8bae1d'}
                    activeStrokeColor={'#8bae1d'}
                    activeStrokeSecondaryColor={'#caeb5e'}
                    activeStrokeWidth={15}
                    inActiveStrokeWidth={15}
                    duration={10000}
                    startInPausedState={false}
                    onAnimationComplete={async () => { await handleStartTrial(); }}
                  >
                    <View flexDirection="column" justifyContent="center" alignItems="center">
                      <View flexDirection="row" justifyContent="center" alignItems="center">
                        <Icon name='phone-iphone' size={80} color="#808080" />
                        <Animated.View style={[animatedDefault]} >
                          <Icon name='arrow-right-alt' size={80} color="#808080" />
                        </Animated.View>
                      </View>
                      <Text style={{ color: '#808080', marginTop: 10 }}>Place the phone on your back...</Text>
                    </View>
                  </CircularProgressBase>
                </View>
                : (!isTrial ?
                  <Animated.View entering={FadeInDown} exiting={FadeOut} >
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 50, marginTop: 200, marginBottom: 50, color: '#141ab8' }}>TRIAL WILL{'\n'}START</Text>
                  </Animated.View> :
                  <View flexDirection="row" justifyContent="center" alignItems="flex-end" style={{ marginTop: 80, marginBottom: 10 }}>
                    <CircularProgressBase
                      value={0}
                      radius={150}
                      maxValue={10}
                      initialValue={10}
                      progressValueColor={'#8bae1d'}
                      activeStrokeColor={'#8bae1d'}
                      activeStrokeSecondaryColor={'#caeb5e'}
                      activeStrokeWidth={15}
                      inActiveStrokeWidth={15}
                      duration={10000}
                      startInPausedState={false}
                      onAnimationComplete={() => Vibration.vibrate(1000)
                      }
                    >
                      <View alignItems="center" justifyContent="center" flexDirection="row">
                        <Icon name='show-chart' size={250} color="#e9e9e9" />
                        <Animated.View style={[styles.animatedIconContainer, animatedStyle]}>
                          <Icon name='directions-walk' size={150} color="#8bae1d" fill='#8F9BB3' />
                        </Animated.View>
                      </View>
                    </CircularProgressBase>
                  </View>
                )
              }

              <Button style={{ marginTop: 70, marginLeft: 100, marginBottom: 170, elevation: 2, width: 200, height: 80, backgroundColor: "#808080", borderWidth: 0, justifyContent: 'center' }} onPress={async () => { await stopTrial(); }}>
                <Text style={{ fontSize: 30, color: 'white' }}>Stop Trial</Text>
              </Button>
            </>)
        }

        {/* Popups */}
        <View style={styles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Trial is over!</Text>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={trialStopped}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={{ ...styles.modalText, marginBottom: 10 }}>Trial was stopped</Text>
                <Text style={styles.errorText}>This trial will not be saved.</Text>
                <TouchableOpacity onPress={() => setTrialStopped(!trialStopped)} style={{ alignSelf: "flex-end" }}>
                  <Text style={{ fontSize: 18, color: '#808080', alignSelf: "flex-end" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

      </Layout>
    </ApplicationProvider>
  );
}

function DualTask() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Text>To be done</Text>
    </ApplicationProvider>
  );
}

export default function Trials() {

  const Tab = createMaterialTopTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: '#8bae1d',
        },
        tabBarLabelStyle: { fontWeight: 'bold' }
      }}
    >
      <Tab.Screen name="Single Task" component={SingleTask} />
      <Tab.Screen name="Dual Task" component={DualTask} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    marginLeft: 7
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#8bae1d',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 30
  },
  errorText: {
    marginBottom: 40,
    textAlign: 'center',
    fontSize: 15,
    color: "red"
  },
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
  },
  animatedIconContainer: {
    position: 'absolute',
  },
});
