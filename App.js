import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "./pages/Home";
import Trials from "./pages/Trials"
import Results from './pages/Results';
import { Text, View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';


const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const [accData, setAccData] = useState([{ x: 0.0000, y: 0.0000, z: 0.0000 }]);

const [subscriptionAcc, setSubscriptionAcc] = useState(null);

const [isTrial, setIsTrial] = useState(false)


var initialTimeAcc = 0;

useEffect(() => {
  const handleAccelerometerData = ({ x, y, z }) => {
    var currentTime = Date.now();
    if (initialTimeAcc === 0) {
      initialTimeAcc = currentTime;
    }
    currentTime = ((currentTime - initialTimeAcc) / 1000).toFixed(2);
    setAccData(prevData => [...prevData, { x: x * 9.8, y: y * 9.8, z: z * 9.8, currentTime }]);
  };

  if (isTrial) {
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(handleAccelerometerData);
    setSubscriptionAcc(subscription);
  } else {
    // If isTrial is false, remove the subscription
    if (subscriptionAcc) {
      subscriptionAcc.remove();
    }
  }

  // Clean up the subscription on component unmount
  return () => {
    if (subscriptionAcc) {
      subscriptionAcc.remove();
      setSubscriptionAcc(null); // Reset the subscription state
    }
  };
}, [isTrial]); 

const styles = StyleSheet.create({
  tinyLogo: {
    width: 60,
    height: 60,
  },
});

const GradientHeader = () => (
  <LinearGradient
    colors={['#8bae1d', '#caeb5e']}
    start={[0, 1]}
    end={[0, 0]}
    style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
  >
    <View style={{ alignItems: 'flex-start', justifyContent: "flex-end", height: 130, marginBottom: 15, marginLeft: 10, marginTop: 15 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          style={styles.tinyLogo}
          source={require('./assets/app-logo.png')}
        />
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={{ fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: 20, color: '#fff' }}>GaitLab</Text>
          <View style={{ backgroundColor: '#fff', height: 1, width: 100, marginTop: 5 }} />
        </View>
      </View>
      <Text style={{ color: '#fff', fontSize: 18, paddingTop: 20 }}>
        Welcome,{' '}
        <Text style={{ fontWeight: 'bold' }}>Rita Silva</Text>
      </Text>
    </View>
  </LinearGradient>
);

const GradientHeader2 = () => (
  <LinearGradient
    colors={['#8bae1d', '#caeb5e']}
    start={[0, 1]}
    end={[0, 0]}
    style={{ flex: 1 }}
  >
  </LinearGradient>
);

const TrialsScreen = () => {
  <Trials accData={accData} isTrial={isTrial}/>
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <GradientHeader />,
      }}
    >
      <Stack.Screen name="HomePage" component={Home} />
    </Stack.Navigator>
  );
}

function TrialStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: () => <GradientHeader2 />,
        headerTitleStyle: {
          color: '#fff',
        },
      }}
    >
      <Stack.Screen name="Trials" component={TrialsScreen} />
    </Stack.Navigator>
  );
}

function ResultsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: () => <GradientHeader2 />,
        headerTitleStyle: {
          color: '#fff',
        },
      }}
    >
      <Stack.Screen name="Result" component={Results} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Trial') {
              iconName = 'directions-walk';
            } else if (route.name === 'Results') {
              iconName = 'equalizer';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: '#141ab8',
          tabBarInactiveTintColor: '#808080',
          tabBarLabelStyle: {
            fontSize: 13,
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Trial" component={TrialStack} />
        <Tab.Screen name="Results" component={ResultsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;