import { WITNESS } from '@arthurka/ts-utils';

declare class NoIntersectionError<T, U> {
  private _;
}

declare global {
  interface ReadonlyArray<T> {
    includes<U extends T>(
      searchElement: T extends { [WITNESS]: unknown } ? T : [U & T] extends [never] ? NoIntersectionError<T, U> : TSReset.WidenLiteral<U>,
      fromIndex?: number,
    ): boolean;
  }

  interface Array<T> {
    includes<U extends T>(
      searchElement: T extends { [WITNESS]: unknown } ? T : [U & T] extends [never] ? NoIntersectionError<T, U> : TSReset.WidenLiteral<U>,
      fromIndex?: number,
    ): boolean;
  }
}
