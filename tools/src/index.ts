import { validateBoardData } from '@cafetulia/engine';

export function verifyBoardStats(): ReturnType<typeof validateBoardData> {
  return validateBoardData();
}
