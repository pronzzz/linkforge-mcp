export declare class LinkForgeError extends Error {
    statusCode: number;
    details?: any;
    constructor(message: string, statusCode?: number, details?: any);
}
export declare class AuthenticationError extends LinkForgeError {
    constructor(message?: string, details?: any);
}
export declare class RateLimitError extends LinkForgeError {
    constructor(message?: string, details?: any);
}
export declare class ValidationError extends LinkForgeError {
    constructor(message?: string, details?: any);
}
//# sourceMappingURL=errors.d.ts.map