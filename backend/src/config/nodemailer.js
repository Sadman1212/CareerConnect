// backend/src/config/nodemailer.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter with Gmail SMTP when credentials are provided
let transporter;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

if (mailUser && mailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use TLS
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Nodemailer configuration error:", error);
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });
} else {
  // Create a stub transporter that logs emails instead of sending when creds missing
  transporter = {
    sendMail: async (mailOptions) => {
      console.warn("⚠️ MAIL_USER or MAIL_PASS not set — email not sent. Mail options:", mailOptions);
      return { messageId: "stubbed-message-id", accepted: [mailOptions.to] };
    },
  };
  console.warn("⚠️ MAIL_USER or MAIL_PASS not configured — using stub email transporter");
}

// Function to send verification email
const sendVerificationEmail = async (recipientEmail, recipientName, verificationLink) => {
  try {
    const mailOptions = {
      from: {
        name: "CareerConnect",
        address: process.env.MAIL_USER,
      },
      to: recipientEmail,
      subject: "✅ Confirm Your Event Registration - CareerConnect",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 40px 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #667eea;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content p {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .verify-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 15px 40px;
              border-radius: 50px;
              font-size: 18px;
              font-weight: bold;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              transition: transform 0.3s ease;
            }
            .verify-button:hover {
              transform: translateY(-2px);
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎉</div>
              <h1>CareerConnect</h1>
            </div>
            
            <div class="content">
              <h2>Congratulations, ${recipientName}! 🎊</h2>
              
              <p>
                You have successfully come this far to register for our career event!
              </p>
              
              <p>
                We're excited to have you join us. To complete your registration, 
                please verify your email address by clicking the button below:
              </p>
              
              <div class="button-container">
                <a href="${verificationLink}" class="verify-button">
                  ✅ Confirm Email
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. 
                Please confirm your email as soon as possible.
              </div>
              
              <p>
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #667eea; font-size: 14px;">
                ${verificationLink}
              </p>
              
              <p style="margin-top: 30px;">
                If you didn't request this registration, please ignore this email.
              </p>
              
              <p style="margin-top: 30px; font-weight: bold;">
                See you at the event! 🚀
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} CareerConnect. All rights reserved.</p>
              <p>Connecting students with career opportunities</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

// Function to send registration confirmation email (after verification)
const sendRegistrationConfirmationEmail = async (recipientEmail, recipientName, eventName, eventDate) => {
  try {
    const mailOptions = {
      from: {
        name: "CareerConnect",
        address: process.env.MAIL_USER,
      },
      to: recipientEmail,
      subject: "🎉 Registration Confirmed - CareerConnect",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              color: white;
              text-align: center;
              padding: 40px 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #11998e;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content p {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .event-details {
              background: #f8f9fa;
              border-left: 4px solid #11998e;
              padding: 20px;
              margin: 20px 0;
            }
            .event-details strong {
              color: #11998e;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">✅</div>
              <h1>Registration Confirmed!</h1>
            </div>
            
            <div class="content">
              <h2>Congratulations, ${recipientName}! 🎉</h2>
              
              <p>
                Your registration for the career event has been successfully confirmed!
              </p>
              
              <div class="event-details">
                <p><strong>📅 Event:</strong> ${eventName}</p>
                <p><strong>🗓️ Date:</strong> ${new Date(eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
              
              <p>
                We're excited to see you there! Make sure to mark your calendar and 
                arrive on time.
              </p>
              
              <p style="margin-top: 30px;">
                If you have any questions, feel free to contact us through our website.
              </p>
              
              <p style="margin-top: 30px; font-weight: bold;">
                See you soon! 🚀
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} CareerConnect. All rights reserved.</p>
              <p>Connecting students with career opportunities</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendRegistrationConfirmationEmail,
};
