export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface ValidationError extends ApiError {
  errors: Record<string, string>;
}
