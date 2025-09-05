export const env = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
