function SignalEnergy(sample) {
  return Math.sqrt((Math.pow(sample.x, 2) + Math.pow(sample.y, 2) + Math.pow(sample.z, 2)));
}


function AMW(accSamples, ACalib) {
  var filteredEnergy = []
  var sum = null

  for (let i = 5; i < accSamples.length - 5; i++) {
    for (let j = i - 5; j < i + 6; j++) {
      sum = sum + SignalEnergy(accSamples[j]) - ACalib
    }
    filteredEnergy.push(sum / (2 * 5 + 1))
    sum = 0
  }

  return filteredEnergy;
}


function StepDetectionAlgorithm(accSamples, ACalib, T, w) {
  var filteredEnergy = AMW(accSamples, ACalib)

  var counter = 0;
  var prev_high = false
  var look_fw = false
  let step_start_idx = [];
  let step_end_idx = [];

  step_start_idx.push(0);


  for (let s_idx = 0; s_idx < filteredEnergy.length; s_idx++) {
    const s = filteredEnergy[s_idx];
    if (!look_fw && s >= T) {
      // If high peak and within energy threshold
      prev_high = true;
      continue;
    } else if (look_fw) {
      counter--;
    }

    if (prev_high && s < T) {
      // After high, look for low
      prev_high = false;
      look_fw = true;
    } else if (look_fw && s >= T) {
      // After low, look for high
      look_fw = false;
      prev_high = true;
      counter = 2 * w;
      continue;
    }

    if (look_fw && s <= -T) {
      // After low, look for low
      step_end_idx.push(s_idx); // End of step
      step_start_idx.push(s_idx); // Start of next step
      counter = 2 * w;
      look_fw = false;
      continue;
    }

    if (counter === 0) {
      // Back to initial state
      prev_high = false;
      look_fw = false;
      counter = 2 * w;
    }
  }

  return { steps: [step_start_idx, step_end_idx], filteredEnergy: filteredEnergy };
}

export default async function Sensors(accSamples) {

  var AbiasX = null
  var AbiasY = null
  var AbiasZ = null
  var ACalib = null

  const numSamples = accSamples.length

  accSamples.map((data) => {
    AbiasX = AbiasX + data.x
    AbiasY = AbiasY + data.y
    AbiasZ = AbiasZ + data.z
  })

  AbiasX = AbiasX / numSamples
  AbiasY = AbiasY / numSamples
  AbiasZ = AbiasZ / numSamples

  ACalib = Math.sqrt(Math.pow(AbiasX, 2) + Math.pow(AbiasY, 2) + Math.pow(AbiasZ, 2))

  return StepDetectionAlgorithm(accSamples, ACalib, 0.1, 5);
}

