import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Routes
import authRoute     from './routes/auth.js';
import userRoute     from './routes/user.js';
import doctorRoute   from './routes/doctor.js';
import medicineRoute from './routes/medicine.js';
import checkoutRoute from './routes/checkout.js';
import bookingRoute  from './routes/booking.js';
import uploadRoute   from './routes/upload.js';

const app = express();

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true }));

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

export default app;
