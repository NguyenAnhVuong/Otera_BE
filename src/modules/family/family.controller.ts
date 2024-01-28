import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Family } from 'src/core/database/entity/family.entity';
import { Roles } from 'src/core/decorator/roles.decorator';
import { UserData } from 'src/core/decorator/user.decorator';
import { ERole } from 'src/core/enum/default.enum';
import { IUserData } from 'src/core/interface/default.interface';
import { VCreateFamilyDto } from './dto/create-family.dto';
import { FamilyService } from './family.service';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create')
  @Roles([ERole.PUBLIC_USER])
  @UseInterceptors(FileInterceptor('avatar'))
  async createFamily(
    @Body() familyParams: VCreateFamilyDto,
    @UploadedFile() avatar: Express.Multer.File,
    @UserData() userData: IUserData,
  ): Promise<Family> {
    return await this.familyService.createFamily(
      familyParams,
      avatar,
      userData.id,
    );
  }
}
