/**
 * A promise that the test resolves by hand. Lets a test keep a mocked Server
 * Action "in flight" to observe the pending state of a form (`useActionState`
 * `pending` flag), then resolve it with the state to display.
 */
export function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}
