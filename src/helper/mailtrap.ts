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
  // port: +process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const FooterMail = {
  footer: `
  ※ Đây là email tự động. Vui lòng không trả lời email này.
  <br />
  <table style="width: 100%; padding-top: 16px;">
    <tr>
      <td style="width: 120px;">
        <img
        src="https://res.cloudinary.com/otera/image/upload/v1719327169/bkhn_avatar_zagpe1.jpg"
        alt="BKHN-Logo"
        style="
        object-fit: cover;
        width: 120px;
        " />
    </td>
    <td style="margin-left: 16px; display: block;">
      <p>Đại học Bách Khoa Hà Nội</p>
      <p>𝐇𝐨𝐭𝐥𝐢𝐧𝐞: 033 394 4588</p>
      <p>𝐀𝐝𝐝𝐫𝐞𝐬𝐬: 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội.</p>
    </td>
  </tr>
 </table>
 `,
};

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
