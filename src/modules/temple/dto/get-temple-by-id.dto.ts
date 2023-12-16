import { IsNumber } from 'class-validator';

export class VGetTempleByIdDto {
  @IsNumber()
  id: number;
}
