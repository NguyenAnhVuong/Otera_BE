import { Global, Module } from '@nestjs/common';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { I18nCustomService } from './i18nCustom.service';

@Global()
@Module({
  providers: [I18nCustomService],
  exports: [I18nCustomService],
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: `${process.cwd()}/src/i18n`,
        watch: true,
      },
    }),
  ],
})
export class I18nCustomModule {}
