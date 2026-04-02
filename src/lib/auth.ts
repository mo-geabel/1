export const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'hickimseonubilmez';
};

export const getEncodedSecret = () => {
  return new TextEncoder().encode(getJwtSecret());
};
