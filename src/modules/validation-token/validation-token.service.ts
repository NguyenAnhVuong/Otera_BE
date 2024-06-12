import { ValidationToken } from '@core/database/entity/validationToken.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ValidationTokenService {
  constructor(
    @InjectRepository(ValidationToken)
    private readonly validationTokenRepository: Repository<ValidationToken>,
  ) {}

  async createValidationToken(
    params: DeepPartial<ValidationToken>,
    entityManager?: EntityManager,
  ) {
    const validationTokenRepository = entityManager
      ? entityManager.getRepository(ValidationToken)
      : this.validationTokenRepository;

    return validationTokenRepository.save(params);
  }

  async getValidationTokenByEmailAndType(
    params: DeepPartial<ValidationToken>,
    entityManager?: EntityManager,
  ) {
    const validationTokenRepository = entityManager
      ? entityManager.getRepository(ValidationToken)
      : this.validationTokenRepository;

    return validationTokenRepository.findOne({
      where: {
        email: params.email,
        type: params.type,
      },
    });
  }

  async updateValidationToken(
    id: number,
    params: DeepPartial<ValidationToken>,
    entityManager?: EntityManager,
  ) {
    const validationTokenRepository = entityManager
      ? entityManager.getRepository(ValidationToken)
      : this.validationTokenRepository;

    return validationTokenRepository.update(
      {
        id,
      },
      {
        ...params,
      },
    );
  }

  async deleteValidationTokenByToken(
    token: string,
    entityManager?: EntityManager,
  ) {
    const validationTokenRepository = entityManager
      ? entityManager.getRepository(ValidationToken)
      : this.validationTokenRepository;

    return validationTokenRepository.delete({
      token,
    });
  }
}
