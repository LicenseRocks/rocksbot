type FaultyPair<T> = [T | null, Error | null];

export async function retrieveFaulty<T>(
  promise: Promise<any>
): Promise<FaultyPair<Awaited<T>>> {
  try {
    const value = await promise;
    return [value as Awaited<T>, null];
  } catch (error) {
    return [null, error];
  }
}
