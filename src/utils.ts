export const catchError = async <T>(
  promise: Promise<T>
): Promise<[Error | undefined, T | undefined]> => {
  try {
    const data = await promise;
    return [undefined, data];
  } catch (error) {
    return [error as Error, undefined];
  }
};
