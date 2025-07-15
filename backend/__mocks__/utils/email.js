// Mock email utilities to avoid hitting real SMTP or Mailtrap limits during tests
export const logEmailConfig = jest.fn();

export const resetTransporter = jest.fn();

export const getTransporter = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mocked-message-id',
    accepted: ['test@example.com'],
    rejected: [],
    response: 'Mock email sent successfully'
  })
});

export const testEmailConfiguration = jest.fn().mockResolvedValue({
  success: true,
  message: 'Mock email configuration test passed'
});

export const sendConfirmationEmail = jest.fn().mockResolvedValue({
  messageId: 'mocked-confirmation-message-id',
  accepted: ['patient@example.com'],
  rejected: [],
  response: 'Mock confirmation email sent successfully'
});

export const sendDoctorNotificationEmail = jest.fn().mockResolvedValue({
  messageId: 'mocked-doctor-notification-message-id',
  accepted: ['doctor@example.com'],
  rejected: [],
  response: 'Mock doctor notification email sent successfully'
});
