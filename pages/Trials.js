import { StyleSheet, View, Modal, Pressable } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import moment from 'moment';
import { db } from "../firebaseConfig";
import { ref, set, onValue } from "firebase/database";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ApplicationProvider, Text, Divider, List, ListItem, Layout, Button } from '@ui-kitten/components';
/* import CircularProgress from 'react-native-circular-progress-indicator';
 */import * as eva from '@eva-design/eva';
import Icon from 'react-native-vector-icons/MaterialIcons';

var accData = []

function SingleTask() {
  //const [accData, setAccData] = useState([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);
  const [gyroData, setGyroData] = useState([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);


  /*  const [subscriptionAcc, setSubscriptionAcc] = useState(null);
   const [subscriptionGyro, setSubscriptionGyro] = useState(null); */

  const [dataset, setDataSet] = useState(0)

  const [isTrial, setIsTrial] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);

  const [trial, setTrial] = useState(null)

  const timeoutIdRef = useRef(null);

  var initialTimeAcc = 0;
  var initialTimeGyro = 0;

  Accelerometer.setUpdateInterval(50);

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

  /*  useEffect(() => {
     Gyroscope.setUpdateInterval(50);
 
     if (isTrial) {
       setSubscriptionGyro(Gyroscope.addListener(({ x, y, z }) => {
         var currentTime = Date.now();
         if (initialTimeGyro === 0) {
           initialTimeGyro = currentTime;
         }
         currentTime = ((currentTime - initialTimeGyro) / 1000).toFixed(2);
         setGyroData(prevData => [...prevData, { x, y, z, currentTime }]);
       }));
     } 
 
    
   }, [isTrial]); */


  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isTrial && accData.length > 1) {
      // This block will be executed when isTrial becomes false
      set(ref(db, 'Patients/' + "rita" + `/sensor_trials/single_task/Trial_${trial + 1}/`), {
        time: moment().format('MMMM Do YYYY, h:mm:ss a'),
        accelerometer: accData.slice(1),
        gyroscope: gyroData.slice(1)
      }).then(() => {
        //setAccData([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);
        setGyroData([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);
        setModalVisible(!modalVisible);
      });
    }
  }, [isTrial]);

  const handleTrial = () => {
    setIsTrial(true)

    //10 seconds
    const id = setTimeout(() => {
      setIsTrial(false);
    }, 10000);

    timeoutIdRef.current = id;
  }

  async function stopTrial() {
    setIsTrial(false)
    console.log(accData)
    if (timeoutIdRef.current) {
      setIsTrial(false)
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
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
       
        <View flexDirection="row" justifyContent="center" alignItems="flex-end" style={{marginTop:150, marginBottom:20}}>
          <Icon name='directions-walk' size={200} color="#808080" fill='#8F9BB3' />
          <Icon name='timer' style={{ marginLeft: -65 }} size={100} color="#e9e9e9" fill='#8F9BB3' />
        </View>
        <Text style={{textAlign:"center"}}>You must walk for at least 10 seconds.</Text>
        {!isTrial ? <Button style={{ marginTop: 70, marginLeft: 100, marginBottom: 170, elevation: 2, width: 200, height:80, backgroundColor: "#8bae1d", borderWidth: 0, justifyContent: 'center' }} onPress={handleTrial}>
          <Text style={{ fontSize: 100, color: 'white' }}>Start Trial</Text>
        </Button> : (
          <Button style={{ marginTop: 25, marginLeft: 100, elevation: 2, width: 200, backgroundColor: "#d3d3d3", borderWidth: 0 }} onPress={async () => { await stopTrial(); }}>
            <Text style={{ fontSize: 30, color: 'white' }}>Stop Trial</Text>
          </Button>
        )}

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
