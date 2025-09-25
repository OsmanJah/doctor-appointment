import nodemailer from 'nodemailer';

// Debug function to check email configuration
export function logEmailConfig() {
  console.log('=== EMAIL CONFIGURATION ===');
  console.log(`MAIL_HOST: ${process.env.MAIL_HOST}`);
  console.log(`MAIL_PORT: ${process.env.MAIL_PORT}`);
  console.log(`MAIL_USER: ${process.env.MAIL_USER ? '✓ Set (masked)' : '❌ Not set'}`);
  console.log(`MAIL_PASS: ${process.env.MAIL_PASS ? '✓ Set (masked)' : '❌ Not set'}`);
  console.log(`MAIL_FROM: ${process.env.MAIL_FROM}`);
  console.log('=========================');
}

// Create a shared transporter instance
let cachedTransporter = null;

// Reset cached transporter when environment changes
export function resetTransporter() {
  cachedTransporter = null;
  console.log('Email transporter reset');
}

export function getTransporter() {
  // Validate required email configuration
  if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    const missing = [];
    if (!process.env.MAIL_HOST) missing.push('MAIL_HOST');
    if (!process.env.MAIL_PORT) missing.push('MAIL_PORT');
    if (!process.env.MAIL_USER) missing.push('MAIL_USER');
    if (!process.env.MAIL_PASS) missing.push('MAIL_PASS');
    throw new Error(`Missing email configuration: ${missing.join(', ')}`);
  }

  if (!cachedTransporter) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const port = Number(process.env.MAIL_PORT);

    console.log('→ Email transport config:', {
      host: process.env.MAIL_HOST,
      port: port,
      user: process.env.MAIL_USER ? '[present]' : '[missing]',
      secure: port === 465,
      pool: true,
      maxConnections: 1,
      rateDelta: 5000,
      rateLimit: 1
    });

    cachedTransporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: port,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      secure: port === 465,
      // Pooling and provider-friendly throttling
      pool: true,
      maxConnections: 1,
      maxMessages: Infinity,
      rateDelta: 5000,
      rateLimit: 1,
      logger: isDevelopment,
      debug: isDevelopment
    });
  }

  return cachedTransporter;
}

// Test the email configuration
export async function testEmailConfiguration() {
  try {
    if (!process.env.MAIL_FROM) {
      console.warn('Warning: MAIL_FROM is not set, using a default sender address');
    }
    const transporter = getTransporter();
    const result = await transporter.verify();
    console.log('Transporter verification result:', result);
    return {
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER ? 'present' : 'missing',
        from: process.env.MAIL_FROM || 'not set'
      }
    };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return {
      success: false,
      message: error.message,
      code: error.code,
      command: error.command
    };
  }
}

// Helpers for safe send with retry/backoff on provider throttling
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err) {
  if (!err) return false;
  const codes = new Set([421, 432, 451, 452, 454, 471, 550]);
  if (typeof err.responseCode === 'number' && codes.has(err.responseCode)) return true;
  const haystack = `${err.message || ''} ${err.response || ''}`.toLowerCase();
  return /too many|rate.?limit|throttl/.test(haystack);
}

async function sendWithRetry(transporter, mailOptions, options = {}) {
  const { retries = 1, initialDelayMs = 5000 } = options; // 5 seconds for Mailtrap
  let attempt = 0;
  let delay = initialDelayMs;
  
  while (true) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      attempt += 1;
      const canRetry = attempt <= retries && isRateLimitError(err);
      console.error(`✗ sendMail failed (attempt ${attempt})`, err?.message || err);
      
      if (!canRetry) {
        throw err;
      }
      
      console.log(`Provider throttle detected. Waiting ${delay}ms before retry...`);
      await sleep(delay);
      delay = Math.min(Math.round(delay * 1.5), 10000);
    }
  }
}

/**
 * Helper function to normalize doctor name display
 */
function formatDoctorName(name) {
  if (!name) return '';
  const cleanName = name.replace(/^Dr\.?\s+/i, '');
  return `Dr ${cleanName}`;
}

/**
 * Send a confirmation email for an appointment booking
 */
export async function sendConfirmationEmail(to, firstName, doctorName, date, time) {
  // Skip email sending in test environment
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    console.log('📧 [MOCK] Confirmation email would be sent to:', to);
    return {
      messageId: 'test-confirmation-message-id',
      accepted: [to],
      rejected: [],
      response: 'Mock confirmation email sent successfully'
    };
  }

  if (!to) {
    console.error('Cannot send email: recipient address is missing');
    throw new Error('Recipient email address is required');
  }

  console.log(`Sending confirmation email to: ${to}`);

  try {
    const transporter = getTransporter();
    const from = process.env.MAIL_FROM || 'MarieCare <no-reply@mariecare.com>';
    const displayDoctorName = formatDoctorName(doctorName);
    const subject = 'Your MarieCare appointment is confirmed';
    const text = `Hi ${firstName}, your appointment with ${displayDoctorName} on ${date} at ${time} is confirmed. See you then!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4FD1C5;">Your appointment is confirmed!</h2>
        <p>Hi ${firstName},</p>
        <p>Your appointment with <strong>${displayDoctorName}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>The MarieCare Team</p>
      </div>
    `;
    const mailOptions = { from, to, subject, text, html };
    console.log('Sending email with:', { from, to, subject, provider: process.env.MAIL_HOST });
    const info = await sendWithRetry(transporter, mailOptions, { retries: 1, initialDelayMs: 5000 });
    console.log('✓ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
    throw error;
  }
}

// Notify doctor of a new booking
export async function sendDoctorNotificationEmail(to, patientName, date, time) {
  // Skip email sending in test environment
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    console.log('📧 [MOCK] Doctor notification email would be sent to:', to);
    return {
      messageId: 'test-doctor-notification-message-id',
      accepted: [to],
      rejected: [],
      response: 'Mock doctor notification email sent successfully'
    };
  }

  if (!to) {
    console.error('Cannot send email: doctor recipient address is missing');
    throw new Error('Doctor email address is required');
  }

  try {
    const transporter = getTransporter();
    const from = process.env.MAIL_FROM || 'MarieCare <no-reply@mariecare.com>';
    const subject = 'New Appointment Booked';
    const text = `A new appointment has been booked by ${patientName} on ${date} at ${time}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4FD1C5;">New Appointment Booking</h2>
        <p>Dear Doctor,</p>
        <p>Patient <strong>${patientName}</strong> has booked an appointment.</p>
        <p><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</p>
        <p>Please log in to your dashboard for details.</p>
        <p>Best regards,<br>The MarieCare Team</p>
      </div>
    `;
    const mailOptions = { from, to, subject, text, html };
    const info = await sendWithRetry(transporter, mailOptions, { retries: 1, initialDelayMs: 5000 });
    console.log('✓ Doctor notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('✗ Failed to send doctor notification email:', error.message);
    throw error;
  }
}