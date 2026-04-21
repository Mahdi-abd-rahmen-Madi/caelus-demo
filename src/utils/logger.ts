/**
 * Logger utility that conditionally logs messages based on environment
 * In production, only error messages are logged by default
 */

const isProduction = import.meta.env.PROD;

const logger = {
    log: (...args: any[]) => {
        if (!isProduction) {
            console.log(...args);
        }
    },
    info: (...args: any[]) => {
        if (!isProduction) {
            console.info(...args);
        }
    },
    warn: (...args: any[]) => {
        if (!isProduction) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
    },
    debug: (...args: any[]) => {
        if (!isProduction) {
            console.debug(...args);
        }
    },
};

export default logger;