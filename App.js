import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "./pages/Home";
import Trials from "./pages/Trials"
import Results from './pages/Results';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { LinearGradient } from 'expo-linear-gradient';


const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const GradientHeader = () => (
  <LinearGradient
    colors={['#8bae1d', '#caeb5e']} 
    start={[0, 1]}
    end={[0, 0]}
    style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
  >
    <View style={{ alignItems: 'flex-start', justifyContent:"flex-end",  height: 100, marginBottom:15, marginLeft:10 }}>
  <Text style={{ color: '#fff', fontSize: 18 }}>
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
      <Stack.Screen name="Trials" component={Trials} />
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
        headerShown:false,
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