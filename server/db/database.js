module.exports = {
  development: {
    username: "postgres",
    password: "123",
    database: "solo-project-kittens",
    host: "127.0.0.1",
    port: "5433",
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "123",
    database: "solo-project-kittens",
    host: "127.0.0.1",
    port: "5433",
    dialect: "postgres",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
