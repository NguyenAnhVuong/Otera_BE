import { Roles } from '@core/decorator/roles.decorator';
import { ERole } from '@core/enum';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTestInput } from './dto/create-test.input';
import { UpdateTestInput } from './dto/update-test.input';
import { Test, Test2 } from './entities/test.entity';
import { TestService } from './test.service';

@Resolver(() => Test)
export class TestResolver {
  constructor(private readonly testService: TestService) {}

  @Mutation(() => Test)
  createTest(@Args('createTestInput') createTestInput: CreateTestInput) {
    return this.testService.create(createTestInput);
  }

  // @Query(() => [Test], { name: 'test' })
  // findAll() {
  //   return this.testService.findAll();
  // }
  @Roles([ERole.PUBLIC_USER])
  @Query(() => Test2, { name: 'test123' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return {
      exampleField: 123,
    };
  }

  @Mutation(() => Test)
  updateTest(@Args('updateTestInput') updateTestInput: UpdateTestInput) {
    return this.testService.update(updateTestInput.id, updateTestInput);
  }

  @Mutation(() => Test)
  removeTest(@Args('id', { type: () => Int }) id: number) {
    return this.testService.remove(id);
  }
}
