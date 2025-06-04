import nodemailer from "nodemailer";

export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async (mailOptions) => {
  const transporter = createEmailTransporter();
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully!");
};
