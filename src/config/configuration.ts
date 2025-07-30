export default () => ({
  app: {
    port: +(process.env.PORT || '3000'),
    mode: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
