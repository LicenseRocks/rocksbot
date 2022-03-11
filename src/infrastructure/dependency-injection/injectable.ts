import { Constructor } from "@infrastructure/dependency-injection/constructor.type";

export const Injectable = (): ((target: Constructor<any>) => void) => {
  return (target: Constructor<any>) => {};
};
