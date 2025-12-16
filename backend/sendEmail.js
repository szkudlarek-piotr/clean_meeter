import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.emailUsername,
    pass: process.env.emailPasswd
  },
    tls: {
    rejectUnauthorized: false,
  }
})
async function sendMail(mailTo, mailSubject, mailText, mailHtml) {
  const mailOptions = {
    from: '"Meeter" <no-reply@meeter.app>',
    to: mailTo,
    subject: mailSubject,
    text: mailText,
    html: mailHtml
  }

  transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}