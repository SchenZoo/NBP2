const SMTP_USERNAME = process.env.SMTP_USERNAME;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false' ? true : false;
export const DEFAULT_SMTP_SENDER_EMAIL = process.env.SMTP_SENDER_EMAIL;
export const DEFAULT_SMTP_SENDER_NAME = process.env.SMTP_SENDER_NAME;

if (!SMTP_USERNAME || !SMTP_PASSWORD || !SMTP_HOST || !SMTP_PORT) {
  console.error('SMTP environment variables missing');
}

export const SMTPOptions = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
  name: '',
};
