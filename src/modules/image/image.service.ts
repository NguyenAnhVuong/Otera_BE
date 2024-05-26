import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/core/database/entity/image.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloudinaryService: CloudinaryService,
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

    const images = await imageRepository.find({ where: { eventId } });

    await this.cloudinaryService.deleteImagesByUrls(
      images.map((image) => image.image),
    );

    await imageRepository.delete({ eventId });
    await imageRepository.save(imageParams);
    return true;
  }

  async updateImageByDeceasedId(
    deceasedId: number,
    imageParams: DeepPartial<Image>[],
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const imageRepository =
      entityManager?.getRepository(Image) || this.imageRepository;
    const images = await imageRepository.find({ where: { deceasedId } });

    await this.cloudinaryService.deleteImagesByUrls(
      images.map((image) => image.image),
    );

    await imageRepository.delete({ deceasedId });
    await imageRepository.save(imageParams);
    return true;
  }

  async deleteImagesByDeceasedId(
    deceasedId: number,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const imageRepository =
      entityManager?.getRepository(Image) || this.imageRepository;
    const images = await imageRepository.find({ where: { deceasedId } });

    await this.cloudinaryService.deleteImagesByUrls(
      images.map((image) => image.image),
    );

    await imageRepository.delete({ deceasedId });
    return true;
  }
}
