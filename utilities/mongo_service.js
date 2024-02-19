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

  async get_all_quizzes() {
    const ret = []

    const categories = await this.models.Category.find()

    for (const category of categories) {
      const c_quiz = await this.models.Quiz.find({category_id: category})
      
      ret.push({
        category: category,
        quizzes: c_quiz
      })
    }

    return ret
  }

  async get_quiz(id) {
    const ret = await this.models.Quiz.findById(id)
    return ret
  }

  async save_quiz(category, title, questions) {
    const q = new this.models.Quiz({
      category_id: category,
      title: title,
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
