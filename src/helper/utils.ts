import { EPriority } from '@core/enum';
import * as bcrypt from 'bcrypt';
import { IPaginationResponse } from 'src/core/interface/default.interface';

export async function handleBCRYPTHash(text: string, salt: string) {
  return await bcrypt.hash(text, salt);
}

export async function handleBCRYPTCompare(text: string, hash: string) {
  return await bcrypt.compare(text, hash);
}

export function returnPagingData(
  data: any,
  totalItems: number,
  params: any,
): IPaginationResponse {
  return {
    data,
    totalItems,
    page: params.page,
    totalPages: Math.ceil(totalItems / params.take),
    take: params.take,
  };
}

export function formatPagingQuery(params: any) {
  params.page = Number(params.page) || 1;
  params.take = Number(params.take) || 10;
  params.skip = (params.page - 1) * params.take;
  return params;
}

export function priorityToNumber(priority: EPriority) {
  switch (priority) {
    case EPriority.HIGH:
      return 3;
    case EPriority.MEDIUM:
      return 2;
    case EPriority.LOW:
      return 1;
    default:
      return 0;
  }
}

/**
 *
 * @param data
 * @param expiresIn by hour, exp: "1h"
 * @returns
 */
