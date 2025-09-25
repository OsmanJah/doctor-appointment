const parseOrigins = (value = "") =>
  value
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN);

export const corsOptions = {
  origin: configuredOrigins.length
    ? (origin, callback) => {
        if (!origin || configuredOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(`CORS blocked request from origin: ${origin}`);
        return callback(null, false);
      }
    : true,
  credentials: true,
  optionsSuccessStatus: 204,
};

export default corsOptions;
