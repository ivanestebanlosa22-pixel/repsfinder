export const logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },
  info: (...args: any[]) => {
    console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  debug: (...args: any[]) => {
    console.debug(...args);
  },
};

export const { log, error, warn, debug, info } = logger;

export default logger;
