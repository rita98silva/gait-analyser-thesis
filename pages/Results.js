import { StyleSheet, View, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicationProvider, Text, Button } from '@ui-kitten/components';
import Timeline from 'react-native-timeline-flatlist';
import * as eva from '@eva-design/eva';
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import { LineChart } from "react-native-chart-kit";

export default function Results({ navigation }) {

  const Tab = createMaterialTopTabNavigator();

  const Stack = createNativeStackNavigator();

  const screenWidth = Dimensions.get("window").width;


  const retrieveData = (trial, task) => {
    const dataRef = ref(db, `Patients/rita/sensor_trials/${task}/${trial}`);

    onValue(dataRef, (snapshot) => {
      const dbData = snapshot.val();
      navigation.navigate('ResultsCharts', {
        energy: dbData.AMW,
        numSteps: dbData.steps[1].length,
      })
    });
  }

  function TimelineTrials({ task }) {

    const [data, setData] = useState([]);

    useEffect(() => {
      const dataRef = ref(db, `Patients/rita/sensor_trials/${task}`);
      onValue(dataRef, (snapshot) => {
        const dbData = snapshot.val();
        const keys = Object.keys(dbData);
        const newData = keys.map((trial) => ({
          time: '',
          title: trial,
          description: dbData[trial].time,
        }));
        setData(newData.reverse());
      });
    }, [task]);

    const renderDetail = (e) => {
      let title = <Text style={{ fontWeight: 'bold' }}>{e.title}</Text>
      let desc = <Text >{e.description}</Text>

      return (
        <Button style={{ ...styles.button, backgroundColor: "#fff" }} onPress={() => retrieveData(e.title, "single_task")}>
          <View flexDirection="column" >
            {title}
            {desc}
          </View>
        </Button>
      )
    }

    return (
      <ApplicationProvider {...eva} theme={eva.light}>
        <Timeline data={data} renderDetail={renderDetail} showTime={false}
          circleColor='rgb(0,156,219)'
          lineColor='rgb(45,156,219)'
          options={{
            style: { paddingTop: 20 }
          }} />
      </ApplicationProvider>
    );
  }

  function ResultsChart({ route, navigation }) {
    const { energy } = route.params
    const { numSteps } = route.params

    const samples = Array.from({ length: energy.length }, (_, i) => i + 1)

    const data = {
      //labels: samples,
      datasets: [
        {
          data: energy,
          color: (opacity = 1) => `rgba(20, 26, 184, ${opacity})`,
          strokeWidth: 2
        }
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: "#FFFFFF",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "#FFFFFF",
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
      fillShadowGradient: 0,
      fillShadowGradientOpacity: 0,
      fillShadowGradientFromOffset: 0
    };

    return (
      <>
        <ApplicationProvider {...eva} theme={eva.light}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 13, marginLeft: 7, marginTop: 20 }}>Step Segmentation</Text>
        </ApplicationProvider>
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={{ elevation: 3 }}
        />

        <ApplicationProvider {...eva} theme={eva.light}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 13, marginLeft: 20, marginTop: 15, alignSelf: "center" }}>Number of steps: {numSteps}</Text>
        </ApplicationProvider>
      </>
    );
  }

  function SingleTask() {

    const TimelineComponent = () => {
      return <TimelineTrials task="single_task" />;
    }

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="TrialTimeline" component={TimelineComponent} />
        <Stack.Screen name="ResultsCharts" component={ResultsChart} />
      </Stack.Navigator>
    );
  }

  function DualTask() {
    return (
      <ApplicationProvider {...eva} theme={eva.light}>
        <Text>To be done</Text>
      </ApplicationProvider>
    );
  }

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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 15,
    elevation: 3,
    height: 50,
    width: 300,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: "#fff",
    justifyContent: "flex-start"
  },
});
