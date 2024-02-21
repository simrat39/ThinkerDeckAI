import mongoose from "mongoose";
import { DatabaseClient } from "./database_client.js";

class MongoService {
  /**
   * MongoService constructor.
   * @param {mongoose.Connection} db_conn - The MongoDB connection.
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
   * Add a new category.
   * @param {string} category - The name of the category to add.
   * @returns {Promise<mongoose.Document>} - A promise that resolves to the newly added category.
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

  /**
   * Get all quizzes grouped by category.
   * @returns {Promise<Array>} - A promise that resolves to an array of objects representing categories and quizzes.
   */
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

  /**
   * Get a quiz by its ID.
   * @param {string} id - The ID of the quiz.
   * @returns {Promise<mongoose.Document|null>} - A promise that resolves to the quiz document, or null if not found.
   */
  async get_quiz(id) {
    const ret = await this.models.Quiz.findById(id)
    return ret
  }

  /**
   * Save a quiz to the database.
   * @param {string} category - The category ID of the quiz.
   * @param {string} title - The title of the quiz.
   * @param {Array} questions - An array of questions for the quiz.
   */
  async save_quiz(category, title, questions) {
    const q = new this.models.Quiz({
      category_id: category,
      title: title,
      questions: questions
    })

    await q.save()
  }

  /**
   * Create MongoDB schemas for User, Category, and Quiz.
   */
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
