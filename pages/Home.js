import { StyleSheet, View, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Button, Text } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library you want to use

export default function Home({ navigation }) {

  return (

    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={styles.container}
        level='2'
      >
        <View flexDirection="column" style={{marginTop:30, marginLeft:10}}>
        <Button style={{...styles.button, backgroundColor:"#8bae1d"}} >
              <View flexDirection="column" justifyContent="center" alignItems="center">
                <Icon name='person' style={{ ...styles.icon, marginBottom: 10 }} size={50} color="#fff" fill='#8F9BB3' />
                <Text category='p1' style={{...styles.text, color: "#fff"}}>My Profile</Text>
              </View>
            </Button>
          <View flexDirection="row" style={{marginTop:20}}>
           

            <Button style={styles.button} onPress={() => navigation.navigate('Trial')}>
              <View flexDirection="column" justifyContent="center" alignItems="center" >
                <Icon name='directions-walk' style={{ ...styles.icon, marginBottom: 10 }} size={50} color="#141ab8" fill='#8F9BB3' />
                <Text category='p1' style={styles.text}>Trial</Text>
              </View>
            </Button>
          

          <Button style={styles.button} onPress={() => navigation.navigate('Results')}>
            <View flexDirection="column"  alignItems="center" >
              <Icon name='show-chart' style={{ ...styles.icon, marginBottom: 10 }} size={50} color="#141ab8" fill='#8F9BB3' />
              <Text category='p1' style={styles.text}>Results</Text>
            </View>
          </Button>
          </View>
        </View>
      </Layout>

    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 1, 

  },
  button: {
    marginHorizontal: 15,
    elevation: 4,
    height: 150,
    width: 150,
    borderRadius: 15,
    borderWidth:0,
    backgroundColor:"#fff"
  },
  text: {
    fontSize:18
  }

});