// Instanz erstellen
const queue = new PromiseQueue();

/**
 * Asynchrone Funktion zur Demonstration
 */
async function queueTest () {

  console.log('Enqueue promise 1');
  queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 1 started');
    setTimeout(resolve, 2000);
  }));

  // Mit Rückgabewert
  console.log('Enqueue promise 2');
  queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 2 started');
    setTimeout(() => resolve(42), 3000);
  }))
    .then((value) => {
      console.log(`Promise 2 returned ${value}`);
    });

  // Fehler in Promise 3 abfangen und auf Fertigstellung dieses Promises
  // in der Queue warten
  console.log('Enqueue promise 3');
  await queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 3 started');
    setTimeout(() => reject(new Error('Test')), 1000);
  }))
    .catch((err) => {
      console.log('Catched error from promise 3:', err);
    });

  // Promise 4 wird erst nach Fertigstellung von Promise 3 eingereiht
  // und es wird ebenfalls auf die Fertigstellung gewartet
  console.log('Enqueue promise 4');
  await queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 4 started');
    setTimeout(resolve, 3000);
  }));

  // Alles erledigt
  console.log('Done');
}

queueTest();
