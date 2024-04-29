// Einbinden des pcf8574 Moduls
const PCF8574 = require('pcf8574').PCF8574;

// Oder importieren nach ES6-Style
// import { PCF8574 } from 'pcf8574';

// Einbinden des i2c-bus Moduls und öffnen des Bus
const i2cBus = require('i2c-bus').openSync(1);

// Die Adresse des PCF8574/PCF8574A festlegen
const addr = 0x38;

// Initialisieren eines neuen PCF8574 mit allen Pins auf high-Level
// Anstelle von 'true' kann auch eine 8-Bit Bitmaske verwendet werden,
// um jeden Pin einzeln festzulegen (z.B. 0b00101010)
const pcf = new PCF8574(i2cBus, addr, true);

// Aktiviere die Interrupt-Erkennung auf BCM-Pin 17 (dies ist GPIO.0)
pcf.enableInterrupt(17);

// Alternativ kann auch beispielsweise ein Intervall verwendet werden,
// um manuell alle 250ms Änderungen abzufragen
// setInterval(pcf.doPoll.bind(pcf), 250);

// Beachte das Fehlende ; am Ende der folgenden Zeilen.
// Die ist eine Promise-Kette!

// Definiere Pin 0 des ICs als invertierten Ausgang mit dem Anfangswert false
pcf.outputPin(0, true, false)

  // Dann definiere Pin 1 als invertierten Ausgang mit dem Anfangswert true
  .then(() => {
    return pcf.outputPin(1, true, true);
  })

  // Dann definiere Pin 7 als nicht invertierten Eingang
  .then(() => {
    return pcf.inputPin(7, false);
  })

  // Warte eine Sekunde
  .then(() => new Promise((resolve) => {
    setTimeout(resolve, 1000);
  }))

  // Dann schalte Pin 0 ein
  .then(() => {
    console.log('turn pin 0 on');
    return pcf.setPin(0, true);
  })

  // Warte eine Sekunde
  .then(() => new Promise((resolve) => {
    setTimeout(resolve, 1000);
  }))

  // Dann schalte Pin 0 aus
  .then(() => {
    console.log('turn pin 0 off');
    return pcf.setPin(0, false);
  });

// Fügen einen Event-Listener dem 'input'-Event hinzu
pcf.on('input', (data) => {
  console.log('input', data);

  // Prüfe ob ein Taster, der mit Pin 7 verbunden ist,
  // gedrückt wurde (Signal am Pin geht auf low)
  if (data.pin === 7 && data.value === false) {
    // Pin 1 toggeln
    pcf.setPin(1);
  }
});

// Handler zum Aufräumen bei einem SIGINT (ctrl+c)
process.on('SIGINT', () => {
  pcf.removeAllListeners();
  pcf.disableInterrupt();
});
