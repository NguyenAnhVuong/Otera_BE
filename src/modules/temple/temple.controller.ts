import { HasuraBody } from '@core/decorator/hasuraBody.decorator';
import { HasuraBodyPaging } from '@core/decorator/hasuraBodyPaging.decorator';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/core/decorator/public.decorator';
import { Roles } from 'src/core/decorator/roles.decorator';
import { UserData } from 'src/core/decorator/user.decorator';
import { ERole } from 'src/core/enum/default.enum';
import { IUserData } from 'src/core/interface/default.interface';
import { VCreateTempleDto } from './dto/create-temple.dto';
import { VGetTempleByIdDto } from './dto/get-temple-by-id.dto';
import { VGetTemplesDto } from './dto/get-temples.dto';
import { TempleService } from './temple.service';

@Controller('temple')
export class TempleController {
  constructor(private readonly templeService: TempleService) {}

  @Post('create')
  @Roles([ERole.PUBLIC_USER])
  @UseInterceptors(FilesInterceptor('images[]'))
  async createTemple(
    @Body() newTemple: VCreateTempleDto,
    @UploadedFiles() images: Express.Multer.File[],
    @UserData() userData: IUserData,
  ) {
    const avatar = images[0];
    images = images.slice(1);

    return await this.templeService.createTemple(
      userData,
      newTemple,
      avatar,
      images,
    );
  }

  @Post('all')
  @Public()
  async getTemples(@HasuraBodyPaging('query') query: VGetTemplesDto) {
    return await this.templeService.getTemples(query);
  }

  @Post('detail')
  @Public()
  async getTempleById(@HasuraBody('query') query: VGetTempleByIdDto) {
    return await this.templeService.getTempleById(query.id);
  }
}
