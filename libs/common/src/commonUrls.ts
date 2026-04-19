export const apiUrls = {
  docs: {
    _: '/docs',
    get swagger() {
      return `${this._}/swagger` as const;
    },
    get scalar() {
      return `${this._}/scalar` as const;
    },
  },
  health: '/health',
  subscribe: '/subscribe',
  confirm: '/confirm',
  unsubscribe: '/unsubscribe',
  subscriptions: '/subscriptions',
} as const;
