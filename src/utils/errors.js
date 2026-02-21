export class LinkForgeError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class AuthenticationError extends LinkForgeError {
    constructor(message = 'Authentication failed', details) {
        super(message, 401, details);
    }
}
export class RateLimitError extends LinkForgeError {
    constructor(message = 'Rate limit exceeded', details) {
        super(message, 429, details);
    }
}
export class ValidationError extends LinkForgeError {
    constructor(message = 'Validation failed', details) {
        super(message, 400, details);
    }
}
//# sourceMappingURL=errors.js.map