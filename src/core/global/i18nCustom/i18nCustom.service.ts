/* eslint-disable @typescript-eslint/ban-types */
import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConstanceService } from '../constance/constance.service';
import { EAppLanguage } from '@core/enum';

export type TLanguage = 'en' | 'ja' | 'vi';

@Injectable()
export class I18nCustomService {
  // private readonly logger = new Logger('I18nCustomService');
  constructor(
    private readonly i18n: I18nService,
    private readonly constanceService: ConstanceService,
  ) {}

  async translate(key: string, args: object) {
    return (await this.i18n.translate(key, {
      lang: this.constanceService.getFallbackLanguage() || EAppLanguage.vi,
      args,
    })) as Promise<string | object | HttpStatus>;
  }
}
