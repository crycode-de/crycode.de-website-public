/**
 * ioBroker script to read voltages and calculate power from INA226 power monitor IC.
 *
 * Copyright (C) 2020-2024 Peter Müller <peter@crycode.de> (https://crycode.de)
 */

const INA_ADDRESS = 0x40;
const R_SHUNT = 0.02;

const CONFIGURATION_REGISTER = 0x00;
const SHUNT_VOLTAGE_REGISTER = 0x01;
const BUS_VOLTAGE_REGISTER = 0x02;

const SHUNT_VOLTAGE_LSB = 0.0000025; // 2.5µV
const BUS_VOLTAGE_LSB = 0.00125; // 1.25mV

const CONFIGURATION_REGISTER_VALUE = 0x4427; // 16 averages, 1.1ms conversion time, shunt and bus continuous

const STATE_SHUNT_VOLTAGE = '0_userdata.0.power-monitor.shunt-voltage';
const STATE_BUS_VOLTAGE = '0_userdata.0.power-monitor.bus-voltage';
const STATE_POWER = '0_userdata.0.power-monitor.power';

/**
 * Function to read data from INA226.
 */
function readIna () {
  sendTo('i2c.0', 'read', {
    address: INA_ADDRESS,
    register: SHUNT_VOLTAGE_REGISTER,
    bytes: 2
  }, (buf) => {
    let shuntVoltage = buf.readUInt16BE();
    if (shuntVoltage & 0x8000) {
      shuntVoltage -= 1; // subtract 1
      shuntVoltage ^= 0xFFFF; // invert bits
      shuntVoltage *= -1; // negate
    }
    shuntVoltage = shuntVoltage * SHUNT_VOLTAGE_LSB;

    sendTo('i2c.0', 'read', {
      address: INA_ADDRESS,
      register: BUS_VOLTAGE_REGISTER,
      bytes: 2
    }, (buf) => {
      let busVoltage = buf.readUInt16BE();
      busVoltage = busVoltage * BUS_VOLTAGE_LSB;

      let power = busVoltage * shuntVoltage / R_SHUNT;

      setState(STATE_SHUNT_VOLTAGE, Math.round(shuntVoltage * 100000) / 100000, true);
      setState(STATE_BUS_VOLTAGE, Math.round(busVoltage * 1000) / 1000, true);
      setState(STATE_POWER, Math.round(power * 100) / 100, true);
    });
  });
}

// create the  objects if not exists
if (!getObject(STATE_SHUNT_VOLTAGE)) {
  setObject(STATE_SHUNT_VOLTAGE, {
    type: 'state',
    common: {
      name: 'Shunt-Spannung',
      role: 'value',
      type: 'number',
      unit: 'V',
      read: true,
      write: false
    },
    native: {},
  });
}
if (!getObject(STATE_BUS_VOLTAGE)) {
  setObject(STATE_BUS_VOLTAGE, {
    type: 'state',
    common: {
      name: 'Bus-Spannung',
      role: 'value',
      type: 'number',
      unit: 'V',
      read: true,
      write: false
    },
    native: {},
  });
}
if (!getObject(STATE_POWER)) {
  setObject(STATE_POWER, {
    type: 'state',
    common: {
      name: 'Leistung',
      role: 'value',
      type: 'number',
      unit: 'W',
      read: true,
      write: false
    },
    native: {},
  });
}

// write config to INA226 on startup ...
let buf = Buffer.alloc(2);
buf.writeUInt16BE(CONFIGURATION_REGISTER_VALUE, 0);
sendTo('i2c.0', 'write', {
  address: INA_ADDRESS,
  register: CONFIGURATION_REGISTER,
  data: buf
}, (b) => {
  // ... then read data and schedule readings
  readIna();
  schedule('0,30 * * * * *', readIna); // every 30 seconds
});
