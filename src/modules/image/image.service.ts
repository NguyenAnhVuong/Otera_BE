import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/core/database/entity/image.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async createImages(
    imageParams: DeepPartial<Image>[],
    entityManager?: EntityManager,
  ): Promise<Image[]> {
    const imageRepository =
      entityManager?.getRepository(Image) || this.imageRepository;
    return await imageRepository.save(imageParams);
  }

  async updateImageByEventId(
    eventId: number,
    imageParams: DeepPartial<Image>[],
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const imageRepository =
      entityManager?.getRepository(Image) || this.imageRepository;

    await imageRepository.delete({ eventId });
    await imageRepository.save(imageParams);
    return true;
  }
}
