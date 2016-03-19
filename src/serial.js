'use strict';

import RxNode from 'rx-node';
import {SerialPort, parsers} from 'serialport';

export function createObservableSerialPort (serialPort) {
  var serialPort = new SerialPort(serialPort, {
    baudrate: 115200,
    encoding: 'utf-8',
    parsers: parsers.raw
  }, true);

  return RxNode.fromReadableStream(serialPort)
    .map(buffer => parseInt(buffer.toString()))
    .filter(distance => !isNaN(distance));

  serialPort.open(error => {
    if (error) {
      throw error;
    }
    serialPort.on('data', buffer => {
      var distance = parseInt(buffer.toString());
      console.log('distance', distance);
    });
  });
}
