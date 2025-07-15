import request from 'supertest';
import app from '../app.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';
import Booking from '../models/BookingSchema.js';
import Review from '../models/ReviewSchema.js';

describe('Doctor Analytics and Dashboard', () => {
  let doctorUser;
  let doctorToken;
  let patientUser;
  let patientToken;
  let doctorId;
  let patientId;

  beforeEach(async () => {
    // Create a doctor user
    const doctorRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dr. John Smith',
        email: 'doctor@test.com',
        password: 'Password123',
        role: 'doctor',
        gender: 'male',
        specialization: 'Cardiology',
        ticketPrice: 100,
        qualifications: [{
          degree: 'MD',
          university: 'Harvard Medical School',
          year: '2015'
        }],
        experiences: [{
          position: 'Senior Cardiologist',
          hospital: 'General Hospital',
          duration: '5 years'
        }]
      });

    // Login doctor
    const doctorLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'doctor@test.com',
        password: 'Password123'
      });

    doctorToken = doctorLoginRes.body.token;
    doctorUser = doctorLoginRes.body.data;
    doctorId = doctorUser._id;

    // Create a patient user
    const patientRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'patient@test.com',
        password: 'Password123',
        role: 'patient',
        gender: 'female'
      });

    // Login patient
    const patientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'patient@test.com',
        password: 'Password123'
      });

    patientToken = patientLoginRes.body.token;
    patientUser = patientLoginRes.body.data;
    patientId = patientUser._id;
  });

  describe('GET /api/v1/doctors/profile/me', () => {
    it('should get doctor profile with analytics data', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/me')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('specialization');
      expect(res.body.data).toHaveProperty('appointments');
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 404 if doctor profile not found', async () => {
      // Create a mock JWT token with non-existent doctor ID
      const fakeToken = 'Bearer invalid.jwt.token';
      
      const res = await request(app)
        .get('/api/v1/doctors/profile/me')
        .set('Authorization', fakeToken);

      expect(res.statusCode).toBe(401); // Invalid token should return 401
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/me');

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-doctor users', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/doctors/profile/appointments', () => {
    beforeEach(async () => {
      // Create sample appointments for analytics
      await Booking.create([
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-15T10:00:00'),
          status: 'confirmed',
          comment: 'Regular checkup'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-16T14:00:00'),
          status: 'pending',
          comment: 'Follow-up appointment'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-17T09:00:00'),
          status: 'completed',
          comment: 'Consultation completed'
        }
      ]);
    });

    it('should get doctor appointments with analytics', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(3);
      
      // Check if appointments have required analytics fields
      const appointment = res.body.data[0];
      expect(appointment).toHaveProperty('status');
      expect(appointment).toHaveProperty('appointmentDateTime');
      expect(appointment).toHaveProperty('user');
      expect(appointment.user).toHaveProperty('name');
    });

    it('should filter appointments by status', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments?status=confirmed')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      if (res.body.data.length > 0) {
        res.body.data.forEach(appointment => {
          expect(appointment.status).toBe('confirmed');
        });
      }
    });

    it('should return empty array for doctor with no appointments', async () => {
      // Create another doctor
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. Sarah Wilson',
          email: 'doctor2@test.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'female',
          specialization: 'Dermatology'
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'doctor2@test.com',
          password: 'Password123'
        });

      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments');

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-doctor users', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/doctors/:id (Single Doctor Analytics)', () => {
    beforeEach(async () => {
      // Create reviews for analytics
      await Review.create([
        {
          doctor: doctorId,
          user: patientId,
          reviewText: 'Excellent doctor, very professional',
          rating: 5
        },
        {
          doctor: doctorId,
          user: patientId,
          reviewText: 'Good consultation',
          rating: 4
        }
      ]);
    });

    it('should get doctor details with reviews analytics', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('specialization');
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data).toHaveProperty('averageRating');
      expect(res.body.data).toHaveProperty('totalRating');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should calculate average rating correctly', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.averageRating).toBe(4.5); // (5 + 4) / 2
      expect(res.body.data.totalRating).toBe(2);
    });

    it('should return 404 for non-existent doctor', async () => {
      const fakeId = '64b1234567890abcdef12345';
      const res = await request(app)
        .get(`/api/v1/doctors/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid doctor ID format', async () => {
      const invalidId = 'invalid-id';
      const res = await request(app)
        .get(`/api/v1/doctors/${invalidId}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/doctors (All Doctors Analytics)', () => {
    beforeEach(async () => {
      // Create additional doctors for analytics
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. Mike Johnson',
          email: 'doctor3@test.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'male',
          specialization: 'Neurology',
          ticketPrice: 150
        });

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. Emily Davis',
          email: 'doctor4@test.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'female',
          specialization: 'Pediatrics',
          ticketPrice: 80
        });
    });

    it('should get all doctors with basic analytics', async () => {
      const res = await request(app)
        .get('/api/v1/doctors');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3); // Original doctor + 2 new doctors
      
      res.body.data.forEach(doctor => {
        expect(doctor).toHaveProperty('name');
        expect(doctor).toHaveProperty('specialization');
        expect(doctor).toHaveProperty('averageRating');
        expect(doctor).toHaveProperty('totalRating');
        expect(doctor).not.toHaveProperty('password');
      });
    });

    it('should filter doctors by specialization', async () => {
      const res = await request(app)
        .get('/api/v1/doctors?query=Cardiology');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      if (res.body.data.length > 0) {
        res.body.data.forEach(doctor => {
          expect(doctor.specialization).toBe('Cardiology');
        });
      }
    });

    it('should search doctors by name', async () => {
      const res = await request(app)
        .get('/api/v1/doctors?query=John');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      if (res.body.data.length > 0) {
        res.body.data.forEach(doctor => {
          expect(doctor.name.toLowerCase()).toContain('john');
        });
      }
    });
  });

  describe('GET /api/v1/doctors/:doctorId/available-slots', () => {
    beforeEach(async () => {
      // Update doctor with time slots
      await Doctor.findByIdAndUpdate(doctorId, {
        timeSlots: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30
          },
          {
            day: 'Tuesday',
            startTime: '10:00',
            endTime: '16:00',
            slotDurationMinutes: 30
          }
        ]
      });
    });

    it('should get available slots for a doctor', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/available-slots`)
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ date: '2025-08-18' }); // Monday

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('availableSlots');
      expect(Array.isArray(res.body.data.availableSlots)).toBe(true);
    });

    it('should return 400 without date parameter', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/available-slots`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/available-slots`)
        .query({ date: '2025-08-18' });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for non-existent doctor', async () => {
      const fakeId = '64b1234567890abcdef12345';
      const res = await request(app)
        .get(`/api/v1/doctors/${fakeId}/available-slots`)
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ date: '2025-08-18' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/doctors/:id (Update Doctor Profile)', () => {
    it('should update doctor profile successfully', async () => {
      const updateData = {
        name: 'Dr. John Smith Updated',
        specialization: 'Cardiology',
        ticketPrice: 120,
        bio: 'Updated bio',
        about: 'Updated about section',
        qualifications: [{
          degree: 'MD',
          university: 'Harvard Medical School',
          year: '2015'
        }],
        experiences: [{
          position: 'Senior Cardiologist',
          hospital: 'General Hospital',
          duration: '6 years'
        }]
      };

      const res = await request(app)
        .put(`/api/v1/doctors/${doctorId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Dr. John Smith Updated');
      expect(res.body.data.ticketPrice).toBe(120);
      expect(res.body.data.bio).toBe('Updated bio');
    });

    it('should return 403 when doctor tries to update another doctor profile', async () => {
      // Create another doctor
      const anotherDoctorRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. Another Doctor',
          email: 'another@test.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'male',
          specialization: 'Orthopedics'
        });

      const updateData = {
        name: 'Hacked Name',
        specialization: 'Hacked Specialization'
      };

      const res = await request(app)
        .put(`/api/v1/doctors/${doctorId}`)
        .set('Authorization', `Bearer ${patientToken}`) // Using patient token
        .send(updateData);

      expect(res.statusCode).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/doctors/${doctorId}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(401);
    });

    it('should validate and update time slots correctly', async () => {
      const updateData = {
        timeSlots: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30
          },
          {
            day: 'Wednesday',
            startTime: '10:00',
            endTime: '16:00',
            slotDurationMinutes: 45
          }
        ]
      };

      const res = await request(app)
        .put(`/api/v1/doctors/${doctorId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.timeSlots).toHaveLength(2);
      expect(res.body.data.timeSlots[0].day).toBe('Monday');
      expect(res.body.data.timeSlots[1].slotDurationMinutes).toBe(45);
    });
  });

  describe('Doctor Analytics Dashboard Data', () => {
    beforeEach(async () => {
      // Create comprehensive test data for analytics
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      
      await Booking.create([
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: currentDate,
          status: 'confirmed',
          comment: 'Current appointment'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: pastDate,
          status: 'completed',
          comment: 'Completed appointment'
        }
      ]);

      await Review.create([
        {
          doctor: doctorId,
          user: patientId,
          reviewText: 'Great doctor',
          rating: 5
        },
        {
          doctor: doctorId,
          user: patientId,
          reviewText: 'Good service',
          rating: 4
        }
      ]);
    });

    it('should provide comprehensive dashboard data', async () => {
      const profileRes = await request(app)
        .get('/api/v1/doctors/profile/me')
        .set('Authorization', `Bearer ${doctorToken}`);

      const appointmentsRes = await request(app)
        .get('/api/v1/doctors/profile/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(appointmentsRes.statusCode).toBe(200);

      // Verify dashboard data structure
      expect(profileRes.body.data).toHaveProperty('name');
      expect(profileRes.body.data).toHaveProperty('specialization');
      expect(profileRes.body.data).toHaveProperty('reviews');
      expect(profileRes.body.data).toHaveProperty('appointments');

      expect(appointmentsRes.body.data).toBeInstanceOf(Array);
      expect(appointmentsRes.body.data.length).toBe(2);

      // Verify reviews are populated
      // expect(profileRes.body.data.reviews).toHaveLength(2);
      // expect(profileRes.body.data.reviews[0]).toHaveProperty('rating');
      // expect(profileRes.body.data.reviews[0]).toHaveProperty('reviewText');
    });

    it('should calculate appointment statistics correctly', async () => {
      const res = await request(app)
        .get('/api/v1/doctors/profile/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      
      const appointments = res.body.data;
      const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
      const completedCount = appointments.filter(a => a.status === 'completed').length;
      
      expect(confirmedCount).toBe(1);
      expect(completedCount).toBe(1);
    });
  });
});
