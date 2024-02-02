import { StyleSheet, View, Modal, Pressable } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import moment from 'moment';
import { db } from "../firebaseConfig";
import { ref, set, onValue } from "firebase/database";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ApplicationProvider, Text, Divider, List, ListItem, Layout, Button } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

function SingleTask() {
  const [accData, setAccData] = useState([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);
  const [gyroData, setGyroData] = useState([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);

  const [subscriptionAcc, setSubscriptionAcc] = useState(null);
  const [subscriptionGyro, setSubscriptionGyro] = useState(null);

  const [isTrial, setIsTrial] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);

  const [trial, setTrial] = useState(null)

  const timeoutIdRef = useRef(null);

  var initialTimeAcc = 0;
  var initialTimeGyro = 0;

  useEffect(() => {
    const dataRef = ref(db, 'Patients/rita/sensor_trials/single_task');

    const fetchData = onValue(dataRef, (snapshot) => {
      const keys = Object.keys(snapshot.val());
      const lastKey = keys[keys.length - 1];
      setTrial(parseInt(lastKey.charAt(lastKey.length - 1), 10))
    });

    return () => fetchData();
  }, []);


  useEffect(() => {
    Accelerometer.setUpdateInterval(200);

    if (isTrial) {
      setSubscriptionAcc(Accelerometer.addListener(({ x, y, z }) => {
        var currentTime = Date.now();
        if (initialTimeAcc === 0) {
          initialTimeAcc = currentTime;
        }
        currentTime = ((currentTime - initialTimeAcc) / 1000).toFixed(2);
        setAccData(prevData => [...prevData, { x, y, z, currentTime }]);
      }));
    }
  }, [isTrial]);


  useEffect(() => {
    Gyroscope.setUpdateInterval(200);

    if (isTrial) {
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


  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);


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
  

  const handleTrial = () => {
    setIsTrial(true)

    const id = setTimeout(() => {
      if (timeoutIdRef.current) {
        setIsTrial(false)

        set(ref(db, 'Patients/' + "rita" + `/sensor_trials/single_task/Trial_${trial + 1}/`), {
          time: moment().format('MMMM Do YYYY, h:mm:ss a'),
          accelerometer: accData.slice(1),
          gyroscope: gyroData.slice(1)
        }).then(() => {
          initialTimeAcc = 0
          initialTimeGyro = 0
          setAccData([{ x: 0.0000, y: 0.0000, z: 0.0000 }])
          setGyroData([{ x: 0.0000, y: 0.0000, z: 0.0000 }])
          setModalVisible(!modalVisible)
        });
      }
    }, 10000);

    timeoutIdRef.current = id;
  }

  const stopTrial = () => {
    if (timeoutIdRef.current) {
      setIsTrial(false)
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
      initialTimeAcc = 0
      initialTimeGyro = 0
    }
  }

  const renderAcc = () => (
    <>
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >x</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.x.toFixed(4)}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >y</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.y.toFixed(4)}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >z</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.z.toFixed(4)}</Text>} />
    </>
  );

  const renderGyro = () => (
    <>
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23, height: 30 }} >x</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.x.toFixed(4)}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >y</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.y.toFixed(4)}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >z</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.z.toFixed(4)}</Text>} />
    </>
  );

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={styles.container}
        level='2'
      >
        <View style={{ justifyContent: "center" }}>
          <View style={{ paddingBottom: 30 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 7, marginLeft: 7, marginTop: 5 }}>Accelerometer [m/s²]</Text>
            <List
              data={[0]}
              ItemSeparatorComponent={Divider}
              renderItem={renderAcc}
            />
          </View>
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 7, marginLeft: 7 }}>Gyroscope [rad/s]</Text>
            <List
              data={[0]}
              ItemSeparatorComponent={Divider}
              renderItem={renderGyro}
            />
          </View>
          {!isTrial ? (<Button style={{ marginTop: 25, marginLeft: 100, elevation: 2, width: 200, backgroundColor: "#8bae1d", borderWidth: 0 }} onPress={handleTrial}>
            <Text style={{ fontSize: 30, color: 'white' }}>Start Trial</Text>
          </Button>) : (<Button style={{ marginTop: 25, marginLeft: 100, elevation: 2, width: 200, backgroundColor: "#d3d3d3", borderWidth: 0 }} onPress={stopTrial}>
            <Text style={{ fontSize: 30, color: 'white' }}>Stop Trial</Text>
          </Button>)}
        </View>
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
});
