/**
 * ioBroker Skript zum automatischen Zurücksetzen des Modus von MAX! Thermostaten
 * auf Auto, wenn die Solltemperatur im Auto-Modus geändert wurde.
 *
 * Dies ist erforderlich, da die Thermostate durch den Max! Cube Adapter bei einer
 * manuellen Änderung der Solltemperatur immer in den manuellen Modus versetzt werden.
 * Dieses Skript erkennt diese Änderung und setzt den Modus zurück auf Auto.
 *
 * Copyright (c) 2019-2024 Peter Müller  (https://crycode.de)
 */

/**
 * Liste an Thermostaten, die ignoriert werden sollen.
 * Dies können z.B. Wandthermostate sein, da diese zusammen mit dem zugehörigen
 * Heizkörperthermostat arbeiten.
 */
const thermostatIgnore = [
  'thermostat_18abcd'
];

// Auflistung aller Thermostate holen
const devices = $('maxcube.0.devices.thermostat_*.mode');

// Alle Thermostate durchgehen
devices.each((id) => {
  id = id.replace(/\.mode$/, '');

  // Prüfen ob das aktuelle Thermostat ignoriert werden soll
  const rfId = id.split('.')[3];
  if (thermostatIgnore.indexOf(rfId) !== -1) return;

  log('setup mode switch back for ' + id);

  // Handler für einen Moduswechsel anlegen
  on({ id: id + '.mode', change: 'ne' }, (obj) => {
    // AUTO(0) -> MANUAL(1) ?
    if (obj.newState.val === 1 && obj.oldState.val === 0) {
      // Letzte Sollwertänderung laden und Zeitpunkt prüfen
      getState(id + '.setpoint', (err, state) => {
        // Wechsel des Modus innerhalb von 10 Sekunden nach dem Wechsel des Sollwerts?
        if (state.ts > obj.newState.ts - 10000) {
          // Modus zurück auf Auto setzen
          log('switching ' + id + ' back to auto mode');
          setState(id + '.mode', 0);
        }
      });
    }
  });
});
