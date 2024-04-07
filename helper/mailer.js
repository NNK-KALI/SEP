const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: config.get("GMAIL_USER"), // sender gmail address
    pass: config.get("GMAIL_APP_PASS"), // sender gmail app password
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(toEmail, subject, html) {
  const mailOptions = {
    from: {
      name: "Annual Athletic meet",
      address: config.get("GMAIL_USER"),
    }, // sender address
    to: toEmail, // list of receivers
    subject: subject,
    html: html
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}


/* sendEmail().catch(console.error); */

module.exports = sendEmail;
