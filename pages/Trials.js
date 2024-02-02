import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import moment from 'moment';
import { db } from "../firebaseConfig";
import { ref, set } from "firebase/database";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ApplicationProvider, Text, Divider, List, ListItem, Layout, Button, ProgressBar } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';



function SingleTask() {
  const [accData, setAccData] = useState([]);
  const [gyroData, setGyroData] = useState([]);

  const [subscriptionAcc, setSubscriptionAcc] = useState(null);
  const [subscriptionGyro, setSubscriptionGyro] = useState(null);

  const [isTrial, setIsTrial] = useState(false)
 
  const [isOver, setIsOver] = useState(false)
 


  var initialTimeAcc = 0;
  var initialTimeGyro = 0;

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
    setIsOver(false)
    setIsTrial(true)

    setTimeout(() => {
      setIsTrial(false)
      set(ref(db, 'trials/' + "joana" + "/trial_4/"), {
        time: moment().format('MMMM Do YYYY, h:mm:ss a'),
        single_task: {
          accelerometer: accData,
          gyroscope: gyroData
        },
        dual_task: {
          accelerometer: "N/A",
          gyroscope: "N/A"
        }

      });
      initialTimeAcc = 0
      initialTimeGyro = 0
      setIsOver(true)
    }, 10000);
  }

  const renderAcc = () => (
    <>
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23  }} >x</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.x}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23  }} >y</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.y}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23  }} >z</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{accData[accData.length - 1]?.z}</Text>} />
    </>
  );

  const renderGyro = () => (
    <>
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23, height:30  }} >x</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.x}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23 }} >y</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.y}</Text>} />
      <ListItem
        title={evaProps => <Text {...evaProps} style={{ ...styles.text, color: "#808080", fontSize: 23  }} >z</Text>}
        description={evaProps => <Text {...evaProps} style={styles.text} >{gyroData[gyroData.length - 1]?.z}</Text>} />
    </>
  );

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
    <Layout
        style={styles.container}
        level='2'
      >
    <View style={{ justifyContent:"center" }}>
    <View style={{ paddingBottom:30 }}>
      <Text  style={{ fontWeight: 'bold', fontSize:20, marginBottom:7, marginLeft:7, marginTop:5 }}>Accelerometer [m/s²]</Text>
      <List
        data={[0]}
        ItemSeparatorComponent={<Divider />}
        renderItem={renderAcc}
      />
      </View>
      <View>
<Text style={{ fontWeight: 'bold', fontSize:20, marginBottom:7, marginLeft:7}}>Gyroscope [rad/s]</Text>
      <List
        data={[0]}
        ItemSeparatorComponent={Divider}
        renderItem={renderGyro}
      />
      </View>
      <Button style={{ marginTop: 25, marginLeft:100, elevation: 2, width:200, backgroundColor:"#141ab8", borderWidth:0}} onPress={handleTrial} >Start Trial</Button>
      </View>
      {/* {isTrial? <ProgressBar
      progress={progress}
    /> : null} */}
      </Layout>
    </ApplicationProvider>
  );
}

function DualTask() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
    <Button>dual task</Button>
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
        tabBarLabelStyle: {fontWeight: 'bold' }
      }}
    >
      <Tab.Screen name="Single Task" component={SingleTask} />
      <Tab.Screen name="Dual Task" component={DualTask} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    //flexDirection: 'row',

    flex: 1, 

  },
  text: {
    fontSize: 20,
    marginLeft: 7
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
