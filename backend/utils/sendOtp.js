import sgMail from "@sendgrid/mail";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// EMAIL OTP FUNCTION
export const sendEmailOTP = async (to, otp) => {
  try {
    const from = process.env.SENDGRID_FROM;

    if (!from) throw new Error("SENDGRID_FROM is missing");
    if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is missing");

    const msg = {
      to,
      from,
      subject: "Your Horizon Bank OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your Horizon Bank OTP is:</p>
        <h1 style="font-size: 32px; color: #2563eb;">${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    };

    await sgMail.send(msg);

    console.log("✅ SendGrid OTP sent to:", to);
  } catch (err) {
    console.error("❌ SendGrid OTP Error:", err.response?.body || err.message);
    throw new Error("Failed to send OTP email");
  }
};

// MOCK SMS (optional)
export const sendSmsOTP = async (phone, otp) => {
  console.log(`(SMS MOCK) OTP ${otp} would be sent to phone ${phone}`);
};
//addd