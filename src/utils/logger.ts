export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${message}`, meta ? meta : '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[WARN] ${message}`, meta ? meta : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, error ? error : '');
    },
    debug: (message: string, meta?: any) => {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, meta ? meta : '');
        }
    }
};
