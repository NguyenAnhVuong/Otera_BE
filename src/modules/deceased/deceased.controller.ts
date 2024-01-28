import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/core/decorator/roles.decorator';
import { UserData } from 'src/core/decorator/user.decorator';
import { ERole } from 'src/core/enum/default.enum';
import { IUserData } from 'src/core/interface/default.interface';
import { DeceasedService } from './deceased.service';
import { VCreateDeceasedDto } from './dto/create-deceased.dto';

@Controller('deceased')
export class DeceasedController {
  constructor(private readonly deceasedService: DeceasedService) {}

  @Post('create')
  @Roles([ERole.FAMILY_ADMIN])
  @UseInterceptors(FilesInterceptor('images[]'))
  async createDeceased(
    @Body() deceasedParams: VCreateDeceasedDto,
    @UploadedFiles() images: Express.Multer.File[],
    @UserData() userData: IUserData,
  ) {
    const avatar = images[0];
    images = images.slice(1);
    return await this.deceasedService.createDeceased(
      deceasedParams,
      avatar,
      images,
      userData,
    );
  }
}
