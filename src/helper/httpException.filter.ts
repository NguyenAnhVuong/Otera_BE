import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { EEnvironment, ErrorMessage } from '@core/enum';
import {
  I18nCustomService,
  TLanguage,
} from '@core/global/i18nCustom/i18nCustom.service';
import { UserService } from '@modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

interface IRequestParams extends Request {
  user?: {
    uid: number;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private logger: Logger = new Logger('Exception');
  constructor(
    private readonly i18n: I18nService,
    private readonly i18nCustomService: I18nCustomService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const request = ctx.getRequest<IRequestParams>();

    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo<GraphQLResolveInfo>();

    // const userId = request.user?.uid || null;

    // let userLang;

    // TODO Don't use language setting by profile
    // if (userId) {
    //   const userLanguage = await this.userService.findUserLanguageById(userId);

    //   userLang = this.i18nCustomService.switchLanguage(userLanguage);
    // }
    if (request) {
      const language: TLanguage = request.headers['accept-language'] || 'en';

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      let message =
        exception instanceof HttpException
          ? exception.getResponse()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      let errorCode = '';

      if (typeof message === 'string') {
        errorCode = message.replace('error.', '');
        message = await this.i18n.translate(message, {
          lang: language,
        });
      }

      if (typeof message === 'object') {
        if (message['message'] === new UnauthorizedException().message) {
          errorCode = ErrorMessage.UNAUTHORIZED;
        } else {
          errorCode = ErrorMessage.INVALID_PARAM;
        }
        if (
          this.configService.get(EConfiguration.ENVIRONMENT) !==
          EEnvironment.DEVELOPMENT
        ) {
          message = await this.i18n.translate(ErrorMessage.INVALID_PARAM, {
            lang: language,
          });
        }
      }

      this.logger.log(`[Exception] - ${message[`message`]}`, message);
      if (status === HttpStatus.NOT_FOUND) {
        response.status(status).json('Not found');
      } else
        response.status(status).json({
          message,
          extensions: {
            statusCode: status,
            data: null,
            errorMessage: message,
            errorCode,
            timestamp: new Date().toISOString(),
          },
          // path: request.url,
        });
    } else {
      // This is for GRAPHQL petitions
      const error = {
        statusCode: HttpStatus.OK,
        data: null,
        errorMessage: 'message',
        errorCode: 'code',
        timestamp: new Date().toISOString(),
        type: info.parentType,
        field: info.fieldName,
      };

      Logger.error(
        `${info.parentType} ${info.fieldName}`,
        JSON.stringify(error),
        'ExceptionFilter',
      );

      return exception;
    }
  }
}
