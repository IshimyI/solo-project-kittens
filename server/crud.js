const { User } = require("./db/models");

const { Op } = require("sequelize");

async function name() {
  await User.destroy({
    where: {
      id: {
        [Op.notIn]: [1, 2, 3],
      },
    },
  });
}

name();
