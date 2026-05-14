const BaseRepository = require("../../common/repository/base.repository");
const { User } = require("../../models");

class AuthRepository extends BaseRepository {
  constructor() {
    super("User", User);
  }

  async findByEmail(db, email) {
    return await this.m(db).findOne({ email }).select("+password");
  }

  async findByMobile(db, mobile) {
    return await this.m(db).findOne({ mobile }).select("+password");
  }

  async findByGoogleId(db, googleId) {
    return await this.m(db).findOne({ googleId });
  }
}

module.exports = new AuthRepository();
