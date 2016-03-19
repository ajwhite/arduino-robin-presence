'use strict';

import RobinSDK from 'robin-js-sdk';
import {createObservableSerialPort} from './serial';
import {createPresenceDetectionWithObservableStream} from './presenceDetection';

// presence duration 1m
const PRESENCE_TTL = 60;
// space for presence
const SPACE = 201;
// user for presence
const USER = 33;

const robinSdk = new RobinSDK(process.env.ROBIN_TOKEN);

// Arduino observable serial stream
var source = createObservableSerialPort('/dev/tty.usbmodem4012711');
var {
  presenceSource,
  noPresenceSource
} = createPresenceDetectionWithObservableStream(source);

presenceSource.subscribe(() => {
  console.log('Person detected at desk, posted presence')
  robinSdk.api.spaces.presence.add(SPACE, {
    user_ref: USER,
    session_ttl: PRESENCE_TTL
  })
  .catch(err => console.log('failed to post presence'));
});

noPresenceSource.subscribe(() => {
  console.log('Nobody detected at desk');
});
