const userRepository = require("./user.repository");

class UserService {
  async getUserProfile(db, userId) {
    return await userRepository.findById(db, userId);
  }

  async updateProfile(db, userId, updateData) {
    return await userRepository.updateById(db, userId, updateData);
  }
}

module.exports = new UserService();
