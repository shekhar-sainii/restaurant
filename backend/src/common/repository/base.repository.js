const mongoose = require("mongoose");

class BaseRepository {
  /**
   * @param {string} modelName - Name of the model (e.g. 'Product')
   * @param {mongoose.Model} staticModel - The default model (for shared mode)
   */
  constructor(modelName, staticModel) {
    this.modelName = modelName;
    this.staticModel = staticModel;
  }

  /**
   * Get the model for the given database connection.
   * @param {mongoose.Connection} db 
   */
  getModel(db) {
    if (db && typeof db.model === "function") {
      // Return model from specific connection
      return db.model(this.modelName);
    }
    return this.staticModel;
  }

  async create(db, data) {
    return await this.getModel(db).create(data);
  }

  async find(db, filter = {}, options = {}) {
    let query = this.getModel(db).find(filter);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.skip) {
      query = query.skip(options.skip);
    }

    return await query.exec();
  }

  async findOne(db, filter = {}) {
    return await this.getModel(db).findOne(filter);
  }

  async findById(db, id) {
    return await this.getModel(db).findById(id);
  }

  async update(db, filter, updateData) {
    return await this.getModel(db).findOneAndUpdate(filter, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateById(db, id, updateData) {
    return await this.getModel(db).findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(db, filter) {
    return await this.getModel(db).findOneAndDelete(filter);
  }

  async deleteById(db, id) {
    return await this.getModel(db).findByIdAndDelete(id);
  }

  async count(db, filter = {}) {
    return await this.getModel(db).countDocuments(filter);
  }

  async exists(db, filter) {
    return await this.getModel(db).exists(filter);
  }

  // Helper for direct model access
  m(db) {
    return this.getModel(db);
  }
}

module.exports = BaseRepository;

