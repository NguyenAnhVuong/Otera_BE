import { ErrorMessage } from '@core/enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface IMailParams {
  to: string | string[];
  title: string;
  content: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async ({ to, title, content }: IMailParams) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // sender address
      to, // list of receivers
      subject: title, // Subject line
      text: content, // plain text body
      html: content, // html body
    });
  } catch (error) {
    console.log({ error });
    throw new HttpException(
      ErrorMessage.SEND_MAIL_FAIL,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
