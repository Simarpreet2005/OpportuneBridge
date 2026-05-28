/**
 * Standardized API Response Utility
 * Provides consistent response format across all endpoints
 */

export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error !== null && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};
