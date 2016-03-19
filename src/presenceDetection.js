'use strict';

import {createObservableSerialPort} from './serial';

// sample averages every 30s
const SAMPLING_DURATION = 30 * 1000;
// sitting distance recognized at 40in
const SITTING_DISTANCE = 40;

export function createPresenceDetectionWithObservableStream(source) {
  // batch readings into average readings
  var averageDistanceSource = source
    .windowWithTime(SAMPLING_DURATION)
    .flatMap(x => x.toArray())
    .map(collection => {
      var sum = collection.reduce((sum, value) => sum + value, 0);
      return sum / collection.length;
    });

  // presence detections below the distance threshold
  var presenceSource = averageDistanceSource
    .filter(average => average <= SITTING_DISTANCE);

  // no presence detections above the distance threshold
  var noPresenceSource = averageDistanceSource
    .filter(average => average > SITTING_DISTANCE);

  return {
    presenceSource,
    noPresenceSource
  };
}
