export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isServerError ? "Internal server error" : err.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && {
      details: err.details || undefined,
      stack: err.stack,
    }),
  });
};

export default errorHandler;
