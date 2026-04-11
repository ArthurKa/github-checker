import { IntegerSecond } from './brands';

export type GitHubApiResp<T> = (
  | {
    success: false;
    error: 404;
  }
  | {
    success: false;
    error: 503;
    retryAfter: IntegerSecond;
  }
  | {
    success: true;
    data: T;
  }
);
