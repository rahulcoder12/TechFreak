const catchAsync = require("./catchAsync");
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail", // This single line tells Nodemailer to configure all ports/SSL automatically
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let info = await transport.sendMail({
      from: `"Tech-Freak" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.log("Email Error: ", err);
    throw err;
  }
}

module.exports = sendEmail;