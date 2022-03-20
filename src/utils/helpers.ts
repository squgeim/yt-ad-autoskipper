export function mainLoop(cb: () => Promise<void>, ms: number): void {
  const call = () => {
    cb().finally(() => {
      setTimeout(() => call(), ms);
    });
  };

  call();
}

function isObject(o: unknown): o is object {
  return typeof o === "object" && o !== null;
}

export function deepmerge<T extends Record<string, unknown>>(
  ...objs: unknown[]
): T {
  let newObj: Record<string, unknown> = {};

  for (const obj of objs) {
    if (!isObject(obj)) continue;

    for (const [key, val] of Object.entries(obj)) {
      if (isObject(val) && key in newObj) {
        newObj = {
          ...newObj,
          [key]: deepmerge(val, newObj[key]),
        };
      } else {
        newObj = {
          ...newObj,
          [key]: val,
        };
      }
    }
  }

  return newObj as T;
}
