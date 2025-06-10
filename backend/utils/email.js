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
    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Log email transport configuration at startup
    console.log('→ Email transport config:', {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER ? '[present]' : '[missing]',
      secure: process.env.MAIL_PORT === '465'
    });
    
    cachedTransporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,              // e.g. sandbox.smtp.mailtrap.io or smtp.sendgrid.net
      port: Number(process.env.MAIL_PORT),      // e.g. 2525 for Mailtrap, 587 for SendGrid
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      secure: process.env.MAIL_PORT === '465',  // use TLS on port 465, otherwise false
      logger: isDevelopment,                    // only log in development
      debug: isDevelopment,                     // only debug in development
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

/**
 * Send a confirmation email for an appointment booking
 * @param {string} to - Recipient email address
 * @param {string} firstName - Patient's first name
 * @param {string} doctorName - Doctor's name
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @param {string} time - Appointment time (HH:MM)
 * @returns {Promise<Object>} - Nodemailer send info
 */
/**
 * Helper function to normalize doctor name display
 * - Removes any existing 'Dr ' prefix from stored name
 * - Ensures consistent formatting with 'Dr ' prefix
 * @param {string} name - Raw doctor name from database
 * @returns {string} - Normalized doctor name for display
 */
function formatDoctorName(name) {
  if (!name) return '';
  
  // Remove any existing 'Dr ' or 'Dr. ' prefix to avoid duplication
  const cleanName = name.replace(/^Dr\.?\s+/i, '');
  
  // Return with consistent 'Dr ' prefix
  return `Dr ${cleanName}`;
}

export async function sendConfirmationEmail(to, firstName, doctorName, date, time) {
  if (!to) {
    console.error('Cannot send email: recipient address is missing');
    throw new Error('Recipient email address is required');
  }
  
  console.log(`Sending confirmation email to: ${to}`);
  
  try {
    const transporter = getTransporter();
    
    // Use MAIL_FROM from environment or fallback to a default
    const from = process.env.MAIL_FROM || 'MarieCare <no-reply@mariecare.com>';
    
    // Format doctor name to avoid the 'Dr Dr' issue
    const displayDoctorName = formatDoctorName(doctorName);
    
    const subject = 'Your MarieCare appointment is confirmed';
    const text = `Hi ${firstName}, your appointment with ${displayDoctorName} on ${date} at ${time} is confirmed. See you then!`;
    
    // Create a simple HTML version with the same content
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
    
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html
    };
    
    // Log simplified mail options (without HTML content to avoid verbose logs)
    console.log('Sending email with:', { 
      from, 
      to, 
      subject,
      provider: process.env.MAIL_HOST
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
    throw error; // Re-throw to allow caller to handle
  }
}

// Notify doctor of a new booking
export async function sendDoctorNotificationEmail(to, patientName, date, time) {
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
      </div>`;
    const mailOptions = { from, to, subject, text, html };
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Doctor notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('✗ Failed to send doctor notification email:', error.message);
    throw error;
  }
}
