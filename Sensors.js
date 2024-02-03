import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebaseConfig";

function StepDetectionFunction (AccSamples, ACalib, T, w){}

export default function Sensors(patient, trial) {

    var AccSamples = null

    var AbiasX = null
    var AbiasY = null
    var AbiasZ = null

    var ACalib = null

    const dataRef = ref(db, `Patients/${patient}/sensor_trials/single_task/${trial}`);

    const fetchData = onValue(dataRef, (snapshot) => {

      AccSamples = snapshot.val()
      const numSamples = snapshot.val().accelerometer.length
      AccSamples.accelerometer.map((data) => {
        AbiasX = AbiasX + data.x
        AbiasY = AbiasY + data.y
        AbiasZ = AbiasZ + data.z
      })
   
      AbiasX = AbiasX/numSamples
      AbiasY = AbiasY/numSamples
      AbiasZ = AbiasZ/numSamples

      ACalib = Math.sqrt(Math.pow(AbiasX, 2) + Math.pow(AbiasY, 2) + Math.pow(AbiasZ, 2))

      console.log(ACalib)
    });

     return fetchData;
}


