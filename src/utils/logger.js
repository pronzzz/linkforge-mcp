export const logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta ? meta : '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta ? meta : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error ? error : '');
    },
    debug: (message, meta) => {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, meta ? meta : '');
        }
    }
};
//# sourceMappingURL=logger.js.map