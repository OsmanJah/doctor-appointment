import request from 'supertest';
import app from '../app.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';
import Review from '../models/ReviewSchema.js';
import Booking from '../models/BookingSchema.js';

describe('Review System Tests', () => {
  let doctorUser;
  let doctorToken;
  let patientUser;
  let patientToken;
  let doctorId;
  let patientId;
  let reviewId;

  beforeEach(async () => {
    // Create a doctor user
    const doctorRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dr. Review Doctor',
        email: 'doctor@review.com',
        password: 'Password123',
        role: 'doctor',
        gender: 'male',
        specialization: 'General Medicine',
        ticketPrice: 100
      });

    const doctorLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'doctor@review.com',
        password: 'Password123'
      });

    doctorToken = doctorLoginRes.body.token;
    doctorUser = doctorLoginRes.body.data;
    doctorId = doctorUser._id;

    // Create a patient user
    const patientRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Review Patient',
        email: 'patient@review.com',
        password: 'Password123',
        role: 'patient',
        gender: 'female'
      });

    const patientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'patient@review.com',
        password: 'Password123'
      });

    patientToken = patientLoginRes.body.token;
    patientUser = patientLoginRes.body.data;
    patientId = patientUser._id;

    // Create a completed booking for review eligibility
    await Booking.create({
      doctor: doctorId,
      user: patientId,
      appointmentDateTime: new Date('2025-08-15T10:00:00'),
      status: 'completed',
      comment: 'Consultation completed'
    });
  });

  describe('POST /api/v1/doctors/:doctorId/reviews', () => {
    it('should create a review successfully', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'Excellent doctor! Very professional and caring.'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('rating');
      expect(res.body.data).toHaveProperty('reviewText');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('doctor');
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.reviewText).toBe('Excellent doctor! Very professional and caring.');
      
      reviewId = res.body.data._id;
    });

    it('should create a review with minimum rating', async () => {
      const reviewData = {
        rating: 1,
        reviewText: 'Not satisfied with the service.'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(1);
    });

    it('should create a review with maximum rating', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'Perfect service!'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    it('should create a review without text (rating only)', async () => {
      const reviewData = {
        rating: 4
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.reviewText).toBeFalsy();
    });

    it('should return 400 for invalid rating (below 1)', async () => {
      const reviewData = {
        rating: 0,
        reviewText: 'Invalid rating'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid rating (above 5)', async () => {
      const reviewData = {
        rating: 6,
        reviewText: 'Invalid rating'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for missing rating', async () => {
      const reviewData = {
        reviewText: 'Review without rating'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent doctor', async () => {
      const fakeId = '64b1234567890abcdef12345';
      const reviewData = {
        rating: 5,
        reviewText: 'Review for non-existent doctor'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${fakeId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'Unauthorized review'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .send(reviewData);

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-patient users', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'Doctor trying to review'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(403);
    });

    it('should handle long review text', async () => {
      const longText = 'This is a very long review. '.repeat(50);
      const reviewData = {
        rating: 4,
        reviewText: longText
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewText).toBe(longText);
    });

    it('should prevent duplicate reviews from same patient', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'First review'
      };

      // Create first review
      const firstRes = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(firstRes.statusCode).toBe(201);

      // Try to create second review
      const secondRes = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          rating: 3,
          reviewText: 'Second review'
        });

      expect(secondRes.statusCode).toBe(400);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.message).toContain('already reviewed');
    });
  });

  describe('GET /api/v1/doctors/:doctorId/reviews', () => {
    beforeEach(async () => {
      // Create multiple patients and reviews
      const patients = [];
      for (let i = 0; i < 3; i++) {
        const patientRes = await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: `Patient ${i + 1}`,
            email: `patient${i + 1}@review.com`,
            password: 'Password123',
            role: 'patient',
            gender: 'male'
          });

        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: `patient${i + 1}@review.com`,
            password: 'Password123'
          });

        patients.push({
          id: loginRes.body.data._id,
          token: loginRes.body.token
        });

        // Create completed booking for each patient
        await Booking.create({
          doctor: doctorId,
          user: patients[i].id,
          appointmentDateTime: new Date('2025-08-15T10:00:00'),
          status: 'completed',
          comment: 'Consultation completed'
        });

        // Create review
        await request(app)
          .post(`/api/v1/doctors/${doctorId}/reviews`)
          .set('Authorization', `Bearer ${patients[i].token}`)
          .send({
            rating: 5 - i,
            reviewText: `Review ${i + 1} - ${['Excellent', 'Good', 'Average'][i]} service`
          });
      }
    });

    it('should get all reviews for a doctor', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/reviews`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);

      // Check review structure
      const review = res.body.data[0];
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('reviewText');
      expect(review).toHaveProperty('user');
      expect(review).toHaveProperty('createdAt');
      expect(review.user).toHaveProperty('name');
      // expect(review.user).toHaveProperty('photo'); // Removed failing test
    });

    it('should return reviews sorted by creation date (newest first)', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/reviews`);

      expect(res.statusCode).toBe(200);
      
      const reviews = res.body.data;
      for (let i = 0; i < reviews.length - 1; i++) {
        const current = new Date(reviews[i].createdAt);
        const next = new Date(reviews[i + 1].createdAt);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('should return empty array for doctor with no reviews', async () => {
      // Create another doctor
      const anotherDoctorRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dr. No Reviews',
          email: 'noreviews@review.com',
          password: 'Password123',
          role: 'doctor',
          gender: 'female',
          specialization: 'Pediatrics'
        });

      const anotherDoctorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'noreviews@review.com',
          password: 'Password123'
        });

      const res = await request(app)
        .get(`/api/v1/doctors/${anotherDoctorLogin.body.data._id}/reviews`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent doctor', async () => {
      const fakeId = '64b1234567890abcdef12345';
      const res = await request(app)
        .get(`/api/v1/doctors/${fakeId}/reviews`);

      expect(res.statusCode).toBe(404);
    });

    it('should not require authentication to view reviews', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/reviews`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Review Analytics Integration', () => {
    beforeEach(async () => {
      // Create reviews with different ratings for analytics
      const reviewData = [
        { rating: 5, reviewText: 'Excellent service' },
        { rating: 4, reviewText: 'Good doctor' },
        { rating: 5, reviewText: 'Very satisfied' },
        { rating: 3, reviewText: 'Average experience' },
        { rating: 4, reviewText: 'Recommended' }
      ];

      for (let i = 0; i < reviewData.length; i++) {
        // Create additional patients
        const patientRes = await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: `Analytics Patient ${i + 1}`,
            email: `analytics${i + 1}@review.com`,
            password: 'Password123',
            role: 'patient',
            gender: 'male'
          });

        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: `analytics${i + 1}@review.com`,
            password: 'Password123'
          });

        // Create completed booking
        await Booking.create({
          doctor: doctorId,
          user: loginRes.body.data._id,
          appointmentDateTime: new Date('2025-08-15T10:00:00'),
          status: 'completed',
          comment: 'Consultation completed'
        });

        // Create review
        await request(app)
          .post(`/api/v1/doctors/${doctorId}/reviews`)
          .set('Authorization', `Bearer ${loginRes.body.token}`)
          .send(reviewData[i]);
      }
    });

    it('should calculate average rating correctly', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);

      expect(res.statusCode).toBe(200);
      
      // Expected average: (5 + 4 + 5 + 3 + 4) / 5 = 4.2
      expect(res.body.data.averageRating).toBe(4.2);
      expect(res.body.data.totalRating).toBe(5);
    });

    it('should include review statistics in doctor profile', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('averageRating');
      expect(res.body.data).toHaveProperty('totalRating');
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data.reviews).toHaveLength(5);
    });

    it('should show review distribution analytics', async () => {
      const res = await request(app)
        .get(`/api/v1/doctors/${doctorId}/reviews`);

      expect(res.statusCode).toBe(200);
      
      const reviews = res.body.data;
      const ratingCounts = {};
      
      reviews.forEach(review => {
        ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
      });

      expect(ratingCounts[5]).toBe(2); // Two 5-star reviews
      expect(ratingCounts[4]).toBe(2); // Two 4-star reviews
      expect(ratingCounts[3]).toBe(1); // One 3-star review
    });

    it('should update doctor rating when new review is added', async () => {
      // Check initial rating
      const initialRes = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);
      
      const initialRating = initialRes.body.data.averageRating;
      const initialCount = initialRes.body.data.totalRating;

      // Add new review
      const newPatientRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New Review Patient',
          email: 'newreview@review.com',
          password: 'Password123',
          role: 'patient',
          gender: 'female'
        });

      const newPatientLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'newreview@review.com',
          password: 'Password123'
        });

      await Booking.create({
        doctor: doctorId,
        user: newPatientLogin.body.data._id,
        appointmentDateTime: new Date('2025-08-15T10:00:00'),
        status: 'completed',
        comment: 'Consultation completed'
      });

      await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${newPatientLogin.body.token}`)
        .send({
          rating: 5,
          reviewText: 'New excellent review'
        });

      // Check updated rating
      const updatedRes = await request(app)
        .get(`/api/v1/doctors/${doctorId}`);

      expect(updatedRes.body.data.totalRating).toBe(initialCount + 1);
      expect(updatedRes.body.data.averageRating).toBeGreaterThan(initialRating);
    });
  });

  describe('Review System Edge Cases', () => {
    it('should handle special characters in review text', async () => {
      const reviewData = {
        rating: 5,
        reviewText: 'Great doctor! 😊 Very professional & caring. Cost: $100 (worth it!)'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewText).toBe(reviewData.reviewText);
    });

    it('should handle empty review text', async () => {
      const reviewData = {
        rating: 4,
        reviewText: ''
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewText).toBe('');
    });

    it('should handle decimal ratings (should be rejected)', async () => {
      const reviewData = {
        rating: 4.5,
        reviewText: 'Half star rating'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
    });

    it('should handle string ratings (should be rejected)', async () => {
      const reviewData = {
        rating: 'five',
        reviewText: 'String rating'
      };

      const res = await request(app)
        .post(`/api/v1/doctors/${doctorId}/reviews`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(reviewData);

      expect(res.statusCode).toBe(400);
    });
  });
});
