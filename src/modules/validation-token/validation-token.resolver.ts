import { Resolver } from '@nestjs/graphql';
import { ValidationTokenService } from './validation-token.service';

@Resolver()
export class ValidationTokenResolver {
  constructor(
    private readonly validationTokenService: ValidationTokenService,
  ) {}
}
