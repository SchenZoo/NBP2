export const API_PATH = process.env.APP_ENV === 'local' ? `http://${process.env.APP_HOST}:${process.env.APP_PORT}` : process.env.APP_HOST;
