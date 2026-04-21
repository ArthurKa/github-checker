/* eslint-disable no-process-env */

import assert from 'assert';
import { NODE_ENV } from '../envVariables/public';

export const processEnvFlags = {
  muteOnceApiLogError500: {
    on() {
      assert(NODE_ENV === 'testing', 'Something went wrong. |e30bg5|');

      process.env.muteOnceApiLogError500 = 'true';
    },
    off() {
      delete process.env.muteOnceApiLogError500;
    },
    isOn() {
      return NODE_ENV === 'testing' && process.env.muteOnceApiLogError500 === 'true';
    },
  },
};
