import nodemailer from 'nodemailer';
// eslint-disable-next-line no-undef
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
// eslint-disable-next-line no-undef
export const accountEmail = process.env.NODEMAILER_EMAIL

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD
  }
})

export default transporter;