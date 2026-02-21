export class LinkForgeError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends LinkForgeError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, details);
  }
}

export class RateLimitError extends LinkForgeError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 429, details);
  }
}

export class ValidationError extends LinkForgeError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, details);
  }
}
