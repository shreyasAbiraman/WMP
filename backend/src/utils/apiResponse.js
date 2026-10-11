export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  const payload = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};
