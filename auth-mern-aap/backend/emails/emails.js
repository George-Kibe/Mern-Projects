import nodemailer from 'nodemailer';
import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Email Verification 
export const sendVerificationEmail = async (email, verificationToken) => {
    // Create a Nodemailer transport object (configure with your email provider)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'buenasconsultants@gmail.com',
            pass: process.env.BUENAS_PASSWORD,
        },
    });

	try {
        const mailOptions = {
            from: 'buenasconsultants@gmail.com',
            to: email,
            subject: `Welcome Aboard, Verify Your Email Organization`,
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
          }
        // Send the email
        const response = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
	}
};

// welcome email

export const sendWelcomeEmail = async (email, name) => {
    // Create a Nodemailer transport object (configure with your email provider)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'buenasconsultants@gmail.com',
            pass: process.env.BUENAS_PASSWORD,
        },
    });

	try {
        const mailOptions = {
            from: 'Realhive Real Estate Website',
            to: email,
            subject: `Welcome to Buenas, ${name}`,
            html: WELCOME_EMAIL_TEMPLATE.replaceAll("{username}", name.toUpperCase()),
          }
        // Send the email
        const response = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
	}
};
