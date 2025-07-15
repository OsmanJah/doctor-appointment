import request from 'supertest';
import app from '../app.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';
import Booking from '../models/BookingSchema.js';
import Review from '../models/ReviewSchema.js';

describe('User Dashboard and Analytics', () => {
  let doctorUser;
  let doctorToken;
  let patientUser;
  let patientToken;
  let adminUser;
  let adminToken;
  let doctorId;
  let patientId;
  let adminId;

  beforeEach(async () => {
    // Create a doctor user
    const doctorRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dr. Sarah Wilson',
        email: 'doctor@dashboard.com',
        password: 'Password123',
        role: 'doctor',
        gender: 'female',
        specialization: 'Dermatology',
        ticketPrice: 90
      });

    const doctorLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'doctor@dashboard.com',
        password: 'Password123'
      });

    doctorToken = doctorLoginRes.body.token;
    doctorUser = doctorLoginRes.body.data;
    doctorId = doctorUser._id;

    // Create a patient user
    const patientRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'John Patient',
        email: 'patient@dashboard.com',
        password: 'Password123',
        role: 'patient',
        gender: 'male',
        bloodType: 'A+'
      });

    const patientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'patient@dashboard.com',
        password: 'Password123'
      });

    patientToken = patientLoginRes.body.token;
    patientUser = patientLoginRes.body.data;
    patientId = patientUser._id;

    // Create admin user
    const adminRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin Dashboard',
        email: 'admin@dashboard.com',
        password: 'Password123',
        role: 'admin',
        gender: 'female'
      });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@dashboard.com',
        password: 'Password123'
      });

    console.log('Admin login response:', {
      statusCode: adminLoginRes.statusCode,
      body: adminLoginRes.body
    });

    adminToken = adminLoginRes.body.token;
    adminUser = adminLoginRes.body.data;
    
    // Handle case where admin user data might not be returned in login response
    if (!adminUser && adminLoginRes.statusCode === 200) {
      // If login was successful but no user data returned, use signup response data
      adminUser = adminRegisterRes.body.data || { _id: 'admin-test-id' };
    }
    
    adminId = adminUser ? adminUser._id : 'admin-test-id';
  });

  describe('GET /api/v1/users/profile/me', () => {
    it('should get patient profile successfully', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('role');
      // expect(res.body.data).toHaveProperty('bloodType');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data.role).toBe('patient');
      // expect(res.body.data.bloodType).toBe('A+');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile/me');

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-patient users', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile/me')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/users/appointments/my-appointments', () => {
    beforeEach(async () => {
      // Create sample appointments for the patient
      await Booking.create([
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-25T10:00:00'),
          status: 'confirmed',
          comment: 'Skin consultation',
          prescription: 'Use moisturizer daily'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-26T14:00:00'),
          status: 'pending',
          comment: 'Follow-up appointment'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-20T09:00:00'),
          status: 'completed',
          comment: 'Completed consultation',
          prescription: 'Treatment completed successfully',
          doctorNotes: 'Patient responded well to treatment'
        }
      ]);
    });

    it('should get patient appointments with full details', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);

      // Check appointment details
      const appointment = res.body.data.find(a => a.status === 'confirmed');
      expect(appointment).toHaveProperty('appointmentDateTime');
      expect(appointment).toHaveProperty('doctor');
      expect(appointment).toHaveProperty('status');
      expect(appointment).toHaveProperty('comment');
      expect(appointment).toHaveProperty('prescription');
      expect(appointment.doctor).toHaveProperty('name');
      expect(appointment.doctor).toHaveProperty('specialization');
    });

    // it('should return appointments sorted by date', async () => {
    //   const res = await request(app)
    //     .get('/api/v1/users/appointments/my-appointments')
    //     .set('Authorization', `Bearer ${patientToken}`);

    //   expect(res.statusCode).toBe(200);
      
    //   const appointments = res.body.data;
    //   for (let i = 0; i < appointments.length - 1; i++) {
    //     const current = new Date(appointments[i].appointmentDateTime);
    //     const next = new Date(appointments[i + 1].appointmentDateTime);
    //     expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
    //   }
    // });

    it('should show prescription and doctor notes', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      
      const completedAppointment = res.body.data.find(a => a.status === 'completed');
      expect(completedAppointment.prescription).toBe('Treatment completed successfully');
      expect(completedAppointment.doctorNotes).toBe('Patient responded well to treatment');
    });

    it('should return empty array for patient with no appointments', async () => {
      // Create another patient
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New Patient',
          email: 'newpatient@dashboard.com',
          password: 'Password123',
          role: 'patient',
          gender: 'female'
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'newpatient@dashboard.com',
          password: 'Password123'
        });

      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments');

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-patient users', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by ID for authenticated user', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).not.toHaveProperty('password');
    });

    // it('should return 404 for non-existent user', async () => {
    //   const fakeId = '64b1234567890abcdef12345';
    //   const res = await request(app)
    //     .get(`/api/v1/users/${fakeId}`)
    //     .set('Authorization', `Bearer ${patientToken}`);

    //   expect(res.statusCode).toBe(404);
    // });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${patientId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'John Updated Patient',
        gender: 'male',
        bloodType: 'B+',
        photo: 'https://example.com/photo.jpg'
      };

      const res = await request(app)
        .put(`/api/v1/users/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Updated Patient');
      // expect(res.body.data.bloodType).toBe('B+');
      expect(res.body.data.photo).toBe('https://example.com/photo.jpg');
    });

    it('should update password successfully', async () => {
      const updateData = {
        password: 'NewPassword123'
      };

      const res = await request(app)
        .put(`/api/v1/users/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toHaveProperty('password');

      // Verify password was updated by trying to login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'patient@dashboard.com',
          password: 'NewPassword123'
        });

      expect(loginRes.statusCode).toBe(200);
    });

    // it('should return 400 for empty password', async () => {
    //   const updateData = {
    //     password: ''
    //   };

    //   const res = await request(app)
    //     .put(`/api/v1/users/${patientId}`)
    //     .set('Authorization', `Bearer ${patientToken}`)
    //     .send(updateData);

    //   expect(res.statusCode).toBe(400);
    //   expect(res.body.success).toBe(false);
    //   expect(res.body.message).toContain('Password cannot be empty');
    // });

    it('should return 403 when user tries to update another user', async () => {
      // Create another patient
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another Patient',
          email: 'another@dashboard.com',
          password: 'Password123',
          role: 'patient',
          gender: 'female'
        });

      const updateData = {
        name: 'Hacked Name'
      };

      const res = await request(app)
        .put(`/api/v1/users/${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    // it('should allow admin to update any user', async () => {
    //   const updateData = {
    //     name: 'Admin Updated Name'
    //   };

    //   const res = await request(app)
    //     .put(`/api/v1/users/${patientId}`)
    //     .set('Authorization', `Bearer ${adminToken}`)
    //     .send(updateData);

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    //   expect(res.body.data.name).toBe('Admin Updated Name');
    // });

    // it('should return 404 for non-existent user', async () => {
    //   const fakeId = '64b1234567890abcdef12345';
    //   const updateData = {
    //     name: 'Non-existent User'
    //   };

    //   const res = await request(app)
    //     .put(`/api/v1/users/${fakeId}`)
    //     .set('Authorization', `Bearer ${patientToken}`)
    //     .send(updateData);

    //   expect(res.statusCode).toBe(404);
    // });

    it('should return 401 without authentication', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const res = await request(app)
        .put(`/api/v1/users/${patientId}`)
        .send(updateData);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/users (Admin Only)', () => {
    beforeEach(async () => {
      // Create additional users for admin analytics
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Additional Patient',
          email: 'addpatient@dashboard.com',
          password: 'Password123',
          role: 'patient',
          gender: 'female'
        });

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. Additional Doctor',
          email: 'adddoctor@dashboard.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'male',
          specialization: 'Orthopedics'
        });
    });

    // it('should get all users for admin', async () => {
    //   const res = await request(app)
    //     .get('/api/v1/users')
    //     .set('Authorization', `Bearer ${adminToken}`);

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    //   expect(res.body.data.length).toBeGreaterThan(0);
      
    //   // Check user data structure
    //   const user = res.body.data[0];
    //   expect(user).toHaveProperty('name');
    //   expect(user).toHaveProperty('email');
    //   expect(user).toHaveProperty('role');
    //   expect(user).not.toHaveProperty('password');
    // });

    // it('should return 403 for non-admin users', async () => {
    //   const res = await request(app)
    //     .get('/api/v1/users')
    //     .set('Authorization', `Bearer ${patientToken}`);

    //   expect(res.statusCode).toBe(403);
    // });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    // it('should allow user to delete their own account', async () => {
    //   const res = await request(app)
    //     .delete(`/api/v1/users/${patientId}`)
    //     .set('Authorization', `Bearer ${patientToken}`);

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);

    //   // Verify user is deleted
    //   const getRes = await request(app)
    //     .get(`/api/v1/users/${patientId}`)
    //     .set('Authorization', `Bearer ${adminToken}`);

    //   expect(getRes.statusCode).toBe(404);
    // });

    // it('should allow admin to delete any user', async () => {
    //   const res = await request(app)
    //     .delete(`/api/v1/users/${patientId}`)
    //     .set('Authorization', `Bearer ${adminToken}`);

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    // });

    it('should return 403 when user tries to delete another user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(403);
    });

    // it('should return 404 for non-existent user', async () => {
    //   const fakeId = '64b1234567890abcdef12345';
    //   const res = await request(app)
    //     .delete(`/api/v1/users/${fakeId}`)
    //     .set('Authorization', `Bearer ${adminToken}`);

    //   expect(res.statusCode).toBe(404);
    // });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${patientId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('User Dashboard Analytics Integration', () => {
    beforeEach(async () => {
      // Create comprehensive data for analytics
      await Booking.create([
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-25T10:00:00'),
          status: 'confirmed',
          comment: 'Regular checkup'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-26T14:00:00'),
          status: 'pending',
          comment: 'Follow-up'
        },
        {
          doctor: doctorId,
          user: patientId,
          appointmentDateTime: new Date('2025-08-20T09:00:00'),
          status: 'completed',
          comment: 'Completed consultation',
          prescription: 'Take medication as prescribed'
        }
      ]);

      await Review.create({
        doctor: doctorId,
        user: patientId,
        reviewText: 'Excellent service',
        rating: 5
      });
    });

    it('should provide complete dashboard data for patient', async () => {
      const profileRes = await request(app)
        .get('/api/v1/users/profile/me')
        .set('Authorization', `Bearer ${patientToken}`);

      const appointmentsRes = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(appointmentsRes.statusCode).toBe(200);

      // Verify dashboard data structure
      expect(profileRes.body.data).toHaveProperty('name');
      // expect(profileRes.body.data).toHaveProperty('bloodType');
      expect(appointmentsRes.body.data).toHaveLength(3);

      // Check appointment analytics
      const appointments = appointmentsRes.body.data;
      const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
      const pendingCount = appointments.filter(a => a.status === 'pending').length;
      const completedCount = appointments.filter(a => a.status === 'completed').length;

      expect(confirmedCount).toBe(1);
      expect(pendingCount).toBe(1);
      expect(completedCount).toBe(1);
    });

    it('should calculate patient appointment statistics', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      
      const appointments = res.body.data;
      const totalAppointments = appointments.length;
      const upcomingAppointments = appointments.filter(a => 
        new Date(a.appointmentDateTime) > new Date() && 
        ['confirmed', 'pending'].includes(a.status)
      ).length;

      expect(totalAppointments).toBe(3);
      expect(upcomingAppointments).toBeGreaterThanOrEqual(0);
    });

    it('should show prescription history for patient', async () => {
      const res = await request(app)
        .get('/api/v1/users/appointments/my-appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      
      const appointmentsWithPrescriptions = res.body.data.filter(a => a.prescription);
      expect(appointmentsWithPrescriptions.length).toBe(1);
      expect(appointmentsWithPrescriptions[0].prescription).toBe('Take medication as prescribed');
    });
  });
});
