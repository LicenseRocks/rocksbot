export interface EventStrategy {
  name: string;
  callback(...args: any[]): Promise<void>;
}
