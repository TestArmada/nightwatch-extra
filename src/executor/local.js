
export default {
  createMetaData() {
    return {
      // Note: browserErrors has been deprecated, but we don't want to regress
      // versions of magellan that consume this property, so we pass it along.
      browserErrors: []
    };
  },
  summerize() {
    return Promise.resolve();
  }
};
