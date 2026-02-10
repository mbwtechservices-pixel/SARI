import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mdsmarch14@gmail.com',
    pass: 'rqgh slak nrxw wiqx',
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SARI - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <h2 style="color: white; text-align: center;">SARI Email Verification</h2>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333;">Your verification code is:</p>
          <h1 style="text-align: center; color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 20px 0;">${otp}</h1>
          <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordReset = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SARI - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <h2 style="color: white; text-align: center;">SARI Password Reset</h2>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

