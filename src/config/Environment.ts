import dotenv = require('dotenv');
import fs = require('fs');


export function initializeEnvironment() {
  dotenv.config();
  if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
    });
  }
}