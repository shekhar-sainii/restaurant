const userRepository = require("./user.repository");

class UserService {
  async getUserProfile(userId) {
    return await userRepository.findById(userId);
  }

  async updateProfile(userId, updateData) {
    return await userRepository.updateById(userId, updateData);
  }
}

module.exports = new UserService();
