/**
 * Interface zur Beschreibung eines eingereihten Promises in der `PromiseQueue`.
 */
interface QueuedPromise<T = any> {
  promise: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

/**
 * Eine einfache Promise Queue, die es ermöglicht mehrere Aufgaben in kontrollierter
 * Reihenfolge abzuarbeiten.
 *
 * Lizenz: CC BY-NC-SA 4.0
 * (c) Peter Müller <peter@crycode.de> (https://crycode.de/promise-queue-in-typescript)
 */
export class PromiseQueue {

  /**
   * Eingereihte Promises.
   */
  private queue: QueuedPromise[] = [];

  /**
   * Indikator, dass aktuell ein Promise abgearbeitet wird.
   */
  private working: boolean = false;

  /**
   * Ein Promise einreihen.
   * Dies fügt das Promise der Warteschlange hinzu. Wenn die Warteschlange leer
   * ist, dann wird das Promise sofort gestartet.
   * @param promise Funktion, die das Promise zurückgibt.
   * @returns Ein Promise, welches eingelöst (oder zurückgewiesen) wird sobald das eingereihte Promise abgearbeitet ist.
   */
  public enqueue<T = void> (promise: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  /**
   * Das erste Promise aus der Warteschlange holen und starten, sofern nicht
   * bereits ein Promise aktiv ist.
   * @returns `true` wenn ein Promise aus der Warteschlange gestartet wurde oder `false` wenn bereits ein Promise aktiv oder die Warteschlange leer ist.
   */
  private dequeue (): boolean {
    if (this.working) {
      return false;
    }

    const item = this.queue.shift();
    if (!item) {
      return false;
    }

    try {
      this.working = true;
      item.promise()
        .then((value) => {
          item.resolve(value);
        })
        .catch((err) => {
          item.reject(err);
        })
        .finally(() => {
          this.working = false;
          this.dequeue()
        });

    } catch (err) {
      item.reject(err);
      this.working = false;
      this.dequeue();
    }

    return true;
  }
}
