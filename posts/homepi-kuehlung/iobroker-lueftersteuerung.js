/**
 * ioBroker script to communicate with the HomePi Fan Microcontroller.
 *
 * Copyright (C) 2020-2024 Peter Müller <peter@crycode.de> (https://crycode.de)
 */

/**
 * I²C address of the fan microcontroller.
 */
const FAN_ADDRESS = 0x66;

/**
 * I²C register to set the fan speed.
 */
const REGISTER_FAN_SPEED = 0x01;

/**
 * I²C register to read the fan rpm.
 */
const REGISTER_RPM = 0x04;

/**
 * Temperature to start the fan at the lowest speed.
 */
const TEMP_START = 35;

/**
 * Temperature to run the fan on the highest speed.
 */
const TEMP_MAX = 60;

/**
 * Hysteresis for temperature changes to smooth the control a bit.
 */
const TEMP_HYST = 1.5;

/**
 * Time after which a set of the fan speed is forced, even if inside the hysteresis.
 */
const FORCE_FAN_SPEED_SET_TIME = 600000; // 10 minutes

/**
 * State to get the current temperature from.
 */
const STATE_TEMPERATURE = 'info.0.sysinfo.cpu.temperature.main';

/**
 * State to write the set fan speed in percent to.
 */
const STATE_PERCENT = '0_userdata.0.fan.percent';

/**
 * State to write the read fan rpm to.
 */
const STATE_RPM = '0_userdata.0.fan.rpm';

let lastTemp = 0;
let lastSpeed = -1;
let nextFanSeedSetForce = Date.now() + FORCE_FAN_SPEED_SET_TIME;

/**
 * Function to read the current fan rpm from the microcontroller.
 */
function readRpm () {
  sendTo('i2c.0', 'read', {
    address: FAN_ADDRESS,
    register: REGISTER_RPM,
    bytes: 1
  }, (buf1) => {
    if (!Buffer.isBuffer(buf1)) {
      log('Error reading lower byte rpm from fan IC!', 'warn');
      return;
    }
    sendTo('i2c.0', 'read', {
      address: FAN_ADDRESS,
      register: REGISTER_RPM + 1,
      bytes: 1
    }, (buf2) => {
      if (!Buffer.isBuffer(buf2)) {
        log('Error reading higher byte rpm from fan IC!', 'warn');
        return;
      }
      const rpm = buf1[0] + (buf2[0] << 8);
      setState(STATE_RPM, {
        val: rpm,
        ack: true
      });
    });
  });
}

/**
 * Map a given value into a given range.
 */
function map (x, in_min, in_max, out_min, out_max) {
  if (x <= in_min) {
    return out_min;
  }
  if (x >= in_max) {
    return out_max;
  }
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Function to send the fan speed to the mircocontroller.
 */
function setFanSpeed (temp, cb) {
  const speed = Math.round(map(temp, TEMP_START, TEMP_MAX, 0, 255));

  if (speed === lastSpeed) {
    return;
  }

  const buf = Buffer.alloc(1);
  buf[0] = speed;

  sendTo('i2c.0', 'write', {
    address: FAN_ADDRESS,
    register: REGISTER_FAN_SPEED,
    data: buf
  }, () => {
    lastSpeed = speed;
    nextFanSeedSetForce = Date.now() + FORCE_FAN_SPEED_SET_TIME;

    setState(STATE_PERCENT, {
      val: Math.round((speed * 100 / 255) * 100) / 100,
      ack: true
    });

    if (cb) {
      cb();
    }
  });
}

// Create the objects if not exists
if (!getObject(STATE_PERCENT)) {
  setObject(STATE_PERCENT, {
    type: 'state',
    common: {
      type: 'number',
      name: 'Fan speed percent',
      role: 'level',
      unit: '%',
      read: true,
      write: false,
    },
    native: {},
  });
}
if (!getObject(STATE_PERCENT)) {
  setObject(STATE_RPM, {
    type: 'state',
    common: {
      type: 'number',
      name: 'Fan speed rpm',
      role: 'value',
      unit: 'RPM',
      read: true,
      write: false,
    },
    native: {},
  });
}

// React on temperature changes
on({ id: STATE_TEMPERATURE, change: 'any' }, (obj) => {
  if (obj.newState.val >= lastTemp + TEMP_HYST || obj.newState.val <= lastTemp - TEMP_HYST || nextFanSeedSetForce <= Date.now()) {
    // change needed
    setFanSpeed(obj.newState.val, () => {
      lastTemp = obj.newState.val;
    });
  }
});

// Read the current fan rpm every 20 seconds
schedule('*/20 * * * * *', () => {
  readRpm();
});

// Set the fan speed to max on startup and read the current fan rpm
setFanSpeed(TEMP_MAX);
readRpm();
