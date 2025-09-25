import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import corsOptions from './config/corsOptions.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoute     from './routes/auth.js';
import userRoute     from './routes/user.js';
import doctorRoute   from './routes/doctor.js';
import medicineRoute from './routes/medicine.js';
import checkoutRoute from './routes/checkout.js';
import bookingRoute  from './routes/booking.js';
import uploadRoute   from './routes/upload.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

if (!isProduction) {
	app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',      authRoute);
app.use('/api/v1/users',     userRoute);
app.use('/api/v1/doctors',   doctorRoute);
app.use('/api/v1/medicines', medicineRoute);
app.use('/api/v1/checkout',  checkoutRoute);
app.use('/api/v1/bookings',  bookingRoute);
app.use('/api/v1/upload',    uploadRoute);

// Simple health endpoint used in tests
app.get('/', (req, res) => res.send('Hello World!'));

app.use(notFound);
app.use(errorHandler);

export default app;
