import { Controller } from '@nestjs/common';
import { FamilyTempleService } from './family-temple.service';

@Controller('family-temple')
export class FamilyTempleController {
  constructor(private readonly familyTempleService: FamilyTempleService) {}
}
