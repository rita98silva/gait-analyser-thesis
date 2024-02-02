import { StyleSheet, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ApplicationProvider, Text, Divider, List, ListItem, Layout } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';


export default function Results() {

  const Tab = createMaterialTopTabNavigator();

  
  function SingleTask() {
    return (
      <ApplicationProvider {...eva} theme={eva.light}>
        <Text>To be done</Text>
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
});
