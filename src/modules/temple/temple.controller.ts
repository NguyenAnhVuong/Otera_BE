import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ERole } from 'src/core/enum/default.enum';
import { Roles } from 'src/core/decorator/roles.decorator';
import { VCreateTempleDto } from './dto/create-temple.dto';
import { TempleService } from './temple.service';
import { UserData } from 'src/core/decorator/user.decorator';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { Public } from 'src/core/decorator/public.decorator';
import { QueryPaging } from 'src/core/decorator/queryPaging.decorator';

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
      userData.id,
      newTemple,
      avatar,
      images,
    );
  }

  @Get('all')
  @Public()
  async getTemples(
    @QueryPaging() query: IPaginationQuery,
    @Query('keyword') keyword: string,
  ) {
    return await this.templeService.getTemples(query, keyword);
  }

  @Get(':id')
  @Public()
  async getTempleById(@Param('id', ParseIntPipe) id: number) {
    return await this.templeService.getTempleById(id);
  }
}
