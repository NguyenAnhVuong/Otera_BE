import { IsString } from 'class-validator';

export class VDeleteImageDto {
  @IsString()
  publicId: string;
}
