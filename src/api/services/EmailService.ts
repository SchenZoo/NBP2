import { CACHE_KEYS } from './../../constants/CacheKeys';
import { Service } from "typedi";
import {
  SMTPOptions,
  DEFAULT_SMTP_SENDER_EMAIL,
} from "../../config/SMTPOptions";
import * as nodemailer from "nodemailer";
import { UserModel, IUser } from "../database/models/User";

@Service()
export class EmailService {
  public transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: SMTPOptions.auth,
    });
  }

  async sendEmail(receiverId: string, subject: string, text: string) {
    const receiver = await UserModel.findById(receiverId).cache({ cacheKey: CACHE_KEYS.ITEM_USER(receiverId) });
    if (!receiver || !receiver.email) {
      return false;
    }
    const mailOptions = {
      from: DEFAULT_SMTP_SENDER_EMAIL,
      to: receiver.email,
      subject,
      text,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve("Email sent");
        }
      });
    });
  }
}
