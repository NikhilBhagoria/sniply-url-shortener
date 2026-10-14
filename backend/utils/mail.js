const nodemailer = require('nodemailer');
const { settings } = require('../config/env');
let testSender;
exports.setTestSender = sender => {
  if (process.env.NODE_ENV !== 'test') throw new Error('Test sender is only available in tests');
  testSender = sender;
};
exports.sendAccountEmail = async (email, kind, token) => {
  const route = kind === 'reset' ? 'reset-password' : 'verify-email';
  // Fragment keeps tokens out of HTTP access logs and referrers.
  const url = `${settings().client}/${route}#token=${token}`;
  const mail = { from: process.env.MAIL_FROM, to: email,
    subject: kind === 'reset' ? 'Reset your Sniply password' : 'Verify your Sniply email',
    text: `Open this link to ${kind === 'reset' ? 'reset your password' : 'verify your email'}:\n${url}\nIf you did not request this, ignore this email.` };
  if (testSender) return testSender(mail);
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) throw new Error('Email service is not configured');
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10000, socketTimeout: 15000,
  });
  await transport.sendMail(mail);
};
