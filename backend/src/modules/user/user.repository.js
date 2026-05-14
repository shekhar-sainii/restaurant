const BaseRepository = require("../../common/repository/base.repository");
const { User } = require("../../models");

class UserRepository extends BaseRepository {
  constructor() {
    super("User", User);
  }
}

module.exports = new UserRepository();
