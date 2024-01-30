import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EAppLanguage, EEnvironment } from '@core/enum';
import { EConfiguration } from '@core/config';
// import { IKeyRedisCache } from '@core/interface';

@Injectable()
export class ConstanceService {
  private appName: string;
  private environment: EEnvironment;
  private fallbackLanguage: EAppLanguage;

  constructor(private configService: ConfigService) {
    this.appName = configService.get<string>(EConfiguration.APP_NAME) ?? '';
    this.environment =
      configService.get<EEnvironment>(EConfiguration.ENVIRONMENT) ??
      EEnvironment.DEVELOPMENT;
    this.fallbackLanguage = EAppLanguage.vi;
  }

  // getKeyCacheRedis(): IKeyRedisCache {
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const vm = this;
  //   return {
  //     RESOURCE: `${this.appName}:${this.environment}:resource`,
  //     CUSTOMERS_BLOCKED: {
  //       name: function (customerId: string) {
  //         return `${vm.appName}:${vm.environment}:${customerId}:customer-blocked`;
  //       },
  //     },
  //   };
  // }

  // getSecretKeyToken() {
  //   return this.configService.get<string>(EConfiguration.AUTH_SECRET_KEY);
  // }

  getFallbackLanguage() {
    return this.fallbackLanguage;
  }
  setFallbackLanguage(language: EAppLanguage) {
    this.fallbackLanguage = language;
  }
}
