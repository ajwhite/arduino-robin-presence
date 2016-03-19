'use strict';

import RobinSDK from 'robin-js-sdk';
import {createObservableSerialPort} from './serial';

// sample averages every 30s
const SAMPLING_DURATION = 30 * 1000;
// sitting distance recognized at 40in
const SITTING_DISTANCE = 40;
// presence duration 1m
const PRESENCE_TTL = 60;
// space for presence
const SPACE = 201;
// user for presence
const USER = 33;
const robinSdk = new RobinSDK(process.env.ROBIN_TOKEN);

// Arduino observable serial stream
var source = createObservableSerialPort('/dev/tty.usbmodem4012711');

// batch readings into average readings
var averageDistanceSource = source
  .windowWithTime(SAMPLING_DURATION)
  .flatMap(x => x.toArray())
  .map(collection => {
    var sum = collection.reduce((sum, value) => sum + value, 0);
    return sum / collection.length;
  });

var personSittingAtDeskSource = averageDistanceSource
  .filter(average => average <= SITTING_DISTANCE);

var personNotSettingAtDeskSource = averageDistanceSource
  .filter(average => average > SITTING_DISTANCE);

personSittingAtDeskSource.subscribe(() => {
  console.log('Person detected at desk, posted presence')
  robinSdk.api.spaces.presence.add(SPACE, {
    user_ref: USER,
    session_ttl: PRESENCE_TTL
  })
  .catch(err => console.log('failed to post presence'))
});

personNotSettingAtDeskSource.subscribe(() => {
  console.log('Nobody detected at desk');
});
