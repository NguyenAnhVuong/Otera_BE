import { EMailType, EPriority } from '@core/enum';
import * as bcrypt from 'bcrypt';
import { IPaginationResponse } from 'src/core/interface/default.interface';
import * as winston from 'winston';

const { combine, timestamp, label, printf } = winston.format;

const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();

export async function handleBCRYPTHash(text: string, salt: string) {
  return await bcrypt.hash(text, salt);
}

export async function handleBCRYPTCompare(text: string, hash: string) {
  return await bcrypt.compare(text, hash);
}

export function returnPagingData(
  data: any,
  totalItems: number,
  params: any,
): IPaginationResponse {
  return {
    data,
    totalItems,
    page: params.page,
    totalPages: Math.ceil(totalItems / params.take),
    take: params.take,
  };
}

export function formatPagingQuery(params: any) {
  params.page = Number(params.page) || 1;
  params.take = Number(params.take) || 10;
  params.skip = (params.page - 1) * params.take;
  return params;
}

export function priorityToNumber(priority: EPriority) {
  switch (priority) {
    case EPriority.HIGH:
      return 3;
    case EPriority.MEDIUM:
      return 2;
    case EPriority.LOW:
      return 1;
    default:
      return 0;
  }
}

export function getWinstonFormat() {
  const myFormat = printf(({ level, message, label, timestamp }) => {
    console.log(label);
    return `[${level.toLocaleUpperCase()}] ${timestamp as string} Message: ${
      message as string
    }`;
  });
  return combine(label({}), timestamp(), myFormat);
}

export function getWinstonPathFile() {
  return new winston.transports.File({
    filename: `${process.cwd()}/logs/${currentYear}-${currentMonth}-${(
      '00' + currentDate.toString()
    ).slice(-2)}_file_log.json`,
    level: 'error',
  });
}

export const generateRandomCode = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
/**
 *
 * @param data
 * @param expiresIn by hour, exp: "1h"
 * @returns
 */

export const getMailFormat = (type: EMailType) => {
  switch (type) {
    case EMailType.APPROVE_EVENT_PARTICIPANT:
      return {
        title: '【Otera】Đăng ký tham gia sự kiện thành công',
        content: `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <tr>
            <td style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
                <p style="font-size: 16px; color: #333333;">Kính gửi {eventParticipantName},</p>

                <p style="font-size: 16px; color: #333333;">Cảm ơn bạn đã đăng ký tham gia sự kiện <strong>{eventName}</strong> của {templeName}.</p>
    
                <p style="font-size: 16px; color: #333333;">Chúng tôi xin trân trọng thông báo rằng đăng ký tham gia sự kiện <strong>{eventName}</strong> đã được chấp thuận bởi thầy <strong>{approverName}</strong>.</p>
                    
                <p style="font-size: 16px; color: #333333;">Mã xác nhận của bạn là: <strong>{code}</strong></p>

                <p style="font-size: 16px; color: #333333;">Vui lòng giữ mã xác nhận này để tham gia sự kiện.</p>

                <p style="font-size: 16px; color: #333333;">Thời gian: {startDateEvent}</p>

                <p style="font-size: 16px; color: #333333;">Địa điểm: {eventAddress}</p>

                <p style="font-size: 16px; color: #333333;">Rất mong có sự góp mặt của bạn.</p>

                <p style="font-size: 16px; color: #333333;">
                    <a href="{eventDetailUrl}" target="_blank" style="color: #1a73e8; text-decoration: none;">Chi tiết thông tin sự kiện {eventName}</a>
                </p>

                <p style="font-size: 16px; color: #333333;">Nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi:</p>

                <p style="font-size: 16px; color: #333333;">
                    <span>{eventPhone}</span><br>
                    <span>{eventEmail}</span>
                </p>

                {footer}
            </td>
        </tr>
    </table>`,
      };

    case EMailType.REGISTER:
      return {
        title: '【Otera】Xác nhận đăng ký tài khoản',
        content: `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <tr>
            <td style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
                <p style="font-size: 16px; color: #333333;">Kính gửi {name},</p>

                <p style="font-size: 16px; color: #333333;">Cảm ơn bạn đã đăng ký tài khoản trên hệ thống Otera.</p>
    
                <p style="font-size: 16px; color: #333333;">Để hoàn tất quá trình đăng ký, vui lòng xác nhận email bằng cách nhấn vào đường dẫn bên dưới.</p>

                <p style="font-size: 16px; color: #333333;">
                    <a href="{verifyUrl}" target="_blank" style="color: #1a73e8; text-decoration: none;">Xác nhận email</a>
                </p>
                    
                <p style="font-size: 16px; color: #333333;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>

                {footer}
            </td>
        </tr>
      </table>`,
      };
    case EMailType.RESET_PASSWORD:
      return {
        title: '【Otera】Yêu cầu đặt lại mật khẩu',
        content: `
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <tr>
              <td style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
                  <p style="font-size: 16px; color: #333333;">Kính gửi {name},</p>
  
                  <p style="font-size: 16px; color: #333333;">Bạn đã yêu cầu đặt lại mật khẩu tài khoản trên hệ thống Otera.</p>
      
                  <p style="font-size: 16px; color: #333333;">Để đặt lại mật khẩu, vui lòng nhấn vào đường dẫn bên dưới.</p>
  
                  <p style="font-size: 16px; color: #333333;">
                      <a href="{resetPasswordUrl}" target="_blank" style="color: #1a73e8; text-decoration: none;">Đặt lại mật khẩu</a>
                  </p>
                      
                  <p style="font-size: 16px; color: #333333;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
  
                  {footer}
              </td>
          </tr>
        </table>`,
      };
    case EMailType.CREATE_EVENT:
      return {
        title: '【Otera】Chùa {templeName} đã tạo sự kiện mới',
        content: `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <tr>
            <td style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
                <p style="font-size: 16px; color: #333333;">Kính gửi {userName},</p>

                <p style="font-size: 16px; color: #333333;">Chùa {templeName} vừa mới tạo sự kiện <strong>{eventName}</strong>.</p>
    
                <p style="font-size: 16px; color: #333333;">Thời gian: {startDateEvent}</p>

                <p style="font-size: 16px; color: #333333;">Địa điểm: {eventAddress}</p>

                <p style="font-size: 16px; color: #333333;">Để xem thông tin chi tiết về sự kiện và cách thức đăng ký tham gia vui lòng truy cập vào đường dẫn dưới đây</p>

                <p style="font-size: 16px; color: #333333;">
                    <a href="{eventDetailUrl}" target="_blank" style="color: #1a73e8; text-decoration: none;">Chi tiết thông tin sự kiện {eventName}</a>
                </p>

                <p style="font-size: 16px; color: #333333;">Rất mong có sự góp mặt của bạn.</p>

                <p style="font-size: 16px; color: #333333;">Nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi:</p>

                <p style="font-size: 16px; color: #333333;">
                    <span>{eventPhone}</span><br>
                    <span>{eventEmail}</span>
                </p>

                {footer}
            </td>
        </tr>
    </table>`,
      };

    default:
      throw new Error();
  }
};
