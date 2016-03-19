'use strict';

import RobinSDK from 'robin-js-sdk';
import {createObservableSerialPort} from './serial';

const DISTANCE_AVERAGE_GROUP_SIZE = 20;
const SITTING_DISTANCE = 40;

var robinSdk = new RobinSDK(process.env.ROBIN_TOKEN);
var space = 201;
var user = 33;

const averageReducer = (collection) => {
  var sum = collection.reduce((sum, value) => sum + value, 0);
  return sum / collection.length;
};

// Arduino serial stream observable from
var source = createObservableSerialPort('/dev/tty.usbmodem4012711');

// batch readings into average readings
var averageDistanceSource = source
  .windowWithCount(DISTANCE_AVERAGE_GROUP_SIZE)
  .flatMap(x => x.toArray())
  .map(averageReducer);


var personSittingAtDeskSource = averageDistanceSource
  .filter(average => average <= SITTING_DISTANCE);

var personNotSettingAtDeskSource = averageDistanceSource
  .filter(average => average > SITTING_DISTANCE);

personSittingAtDeskSource.subscribe(() => {
  console.log('Person detected in room, posted presence')
  robinSdk.api.spaces.presence.add(space, {
    user_ref: user,
    session_ttl: 30
  })
  .catch(err => console.log('failed to post presence'))
});

personNotSettingAtDeskSource.subscribe(() => {
  console.log('Nobody detected in room');
});
