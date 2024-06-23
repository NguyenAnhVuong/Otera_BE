import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class VUpdateTempleInput {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  avatar?: string;

  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  descriptionImages?: string[];

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  address?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phone?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  website: string;
}
