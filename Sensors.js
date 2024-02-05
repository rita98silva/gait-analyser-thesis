import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebaseConfig";


function SignalEnergy (sample) {
 
  return Math.sqrt(Math.pow(sample.x, 2) + Math.pow(sample.y, 2) + Math.pow(sample.z, 2));
} 

function AMW (AccSamples, ACalib) {

  var filteredEnergy = []

  var sum = null

  for(let i = 5; i< AccSamples.length - 5; i++) {
    for (let j = i - 5; j < i + 6; j++ ) {
      sum = sum + SignalEnergy(AccSamples[j]) - ACalib
    }
    filteredEnergy.push(sum/(2*5 + 1))
    sum = 0
  }

  //console.log(filteredEnergy)

  return null;
}

function StepDetection (AccSamples, ACalib, T, w){

}



export default function Sensors(patient, trial) {

    var AccSamples = null

    var AbiasX = null
    var AbiasY = null
    var AbiasZ = null

    var ACalib = null

    const dataRef = ref(db, `Patients/${patient}/sensor_trials/single_task/Trial_6`);

    const fetchData = onValue(dataRef, (snapshot) => {

      AccSamples = snapshot.val().accelerometer
      const numSamples = snapshot.val().accelerometer.length
      AccSamples.map((data) => {
        //console.log(data.currentTime)
        AbiasX = AbiasX + data.x
        AbiasY = AbiasY + data.y
        AbiasZ = AbiasZ + data.z
      })
   
      AbiasX = AbiasX/numSamples
      AbiasY = AbiasY/numSamples
      AbiasZ = AbiasZ/numSamples

      ACalib = Math.sqrt(Math.pow(AbiasX, 2) + Math.pow(AbiasY, 2) + Math.pow(AbiasZ, 2))

   
      AMW(AccSamples, ACalib)
    });

    

     return fetchData;
}


