import mongoose from "mongoose";
import { DatabaseClient } from "./database_client.js";

class MongoService {
  /**
   * @param {mongoose.Connection} db_conn
   */
  constructor() {
    if (!MongoService.instance) {
      this._conn = new DatabaseClient();
      /**
       * @type {{Category: mongoose.Document}}
       */
      this.models = {};
      this.create_schemas();

      MongoService.instance = this;
    }

    return MongoService.instance;
  }

  /**
   * @param {string} category
   */
  async add_category(category) {
    const current = await this.models.Category.findOne({ name: category });
    if (current !== null) {
      return current;
    }

    const newCat = new this.models.Category({
      name: category,
    });
    await newCat.save();

    return newCat;
  }

  async save_quiz(category, questions) {
    const q = new this.models.Quiz({
      category_id: category,
      title: "Title",
      questions: questions
    })

    await q.save()
  }

  create_schemas() {
    // user schema
    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    });
    this.models.User = mongoose.model("User", userSchema);

    // category schema
    const categorySchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
    });
    this.models.Category = mongoose.model("Category", categorySchema);

    // quiz schema
    const quizSchema = new mongoose.Schema({
      category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      questions: {
        type: Array,
        required: true,
      },
    });
    this.models.Quiz = mongoose.model("Quiz", quizSchema);
  }
}

export default MongoService;
