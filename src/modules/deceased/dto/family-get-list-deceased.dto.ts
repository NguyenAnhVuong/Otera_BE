import { PaginationQuery } from '@core/global/entities/paginationQuery.entity';
import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export class VFamilyGetListDeceasedArgs extends PaginationQuery {}
