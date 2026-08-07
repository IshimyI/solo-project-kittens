module.exports = {
  development: {
    username: "postgres",
    password: "123",
    database: "solo-project-kittens",
    host: "127.0.0.1",
    port: 5433,
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "123",
    database: "solo-project-kittens",
    host: "127.0.0.1",
    port: 5433,
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DB",
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
};
