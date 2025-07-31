export default () => ({
  app: {
    port: +(process.env.PORT || '3000'),
    mode: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
