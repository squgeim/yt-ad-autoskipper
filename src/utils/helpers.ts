export function mainLoop(cb: () => Promise<void>, ms: number): void {
  const call = () => {
    cb().finally(() => {
      setTimeout(() => call(), ms);
    });
  };

  call();
}
