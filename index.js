import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import path from "path";
import authRouter from "./routes/auth.js"
import DatabaseConnection from "./utilities/database_connection.js"
import logged_in_check from "./utilities/logged_in_check_middleware.js";
import generateImages from "./utilities/dalleClient.js";
import generateQues from "./utilities/gptClient.js";

const connection = new DatabaseConnection()

const app = express();
const upload = multer();

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));

app.use("/", authRouter);

  app.post("/get_questions", logged_in_check, upload.none(), async function (req, res) {
  try {
    // Extract data from the request
    const subject = req.body.subject;
    const num_ques = req.body.num_ques;

    // Generate questions through GPT-4 
    const generatedQuestions = await generateQues(subject, num_ques);

    // Generate images through DALL-E 2
    const generatedImages = await generateImages(generatedQuestions);

    // Assuming the language is always English!!!
    const [languages] = await connection
      .promise()
      .query("SELECT language_id FROM Languages WHERE language_name = ?", [
        "English",
      ]);
    const languageId = languages[0].language_id;

    // Get the category ID based on the subject
    let [categories] = await connection
      .promise()
      .query("SELECT category_id FROM Categories WHERE category_name = ?", [
        subject,
      ]);
    if (categories[0] == undefined) {
      await connection
        .promise()
        .query(
          "INSERT into Categories (language_id, category_name) VALUES (?, ?)",
          [1, subject]
        );

      categories = (
        await connection
          .promise()
          .query("SELECT category_id FROM Categories WHERE category_name = ?", [
            subject,
          ])
      )[0];
      console.log(categories);
    }
    const categoryId = categories[0].category_id;

    // Insert the generated questions and options into the database
    for (const questionObj of generatedQuestions) {
      const questionText = questionObj.question;
      const choices = questionObj.choices;
      const correctAnswer = questionObj.answer;

      // Start a database transaction
      await connection.promise().beginTransaction();

      // Insert the question
      const [questionResult] = await connection
        .promise()
        .query(
          "INSERT INTO Questions (category_id, language_id, question_text) VALUES (?, ?, ?)",
          [categoryId, languageId, questionText]
        );

      const questionId = questionResult.insertId;

      // Insert the options
      for (const choice of choices) {
        const isCorrect = choice === correctAnswer;
        await connection
          .promise()
          .query(
            "INSERT INTO Options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
            [questionId, choice, isCorrect]
          );
      }

      // Commit the transaction
      await connection.promise().commit();
    }

    // Render the question stack view with the generated questions
    res.render("questionStack", { questions: generatedQuestions });
  } catch (error) {
    // Rollback the transaction in case of an error
    await connection.promise().rollback();
    console.error(error);
    res.status(500).send("An error occurred while generating the questions.");
  }
});

app.get("/questions", logged_in_check, (req, res) => {
  const dummyQuestions = [
    { question: "What is the capital of France?" },
    { question: "What is the largest planet in our solar system?" },
  ];
  res.render("questionStack", { questions: dummyQuestions });
});

app.get("/", (req, res) => {
  console.log(!!req.user)
  res.render("landingPage", {loggedIn: !!req.user});
});

app.get("/generate-quiz", logged_in_check, (req, res) => {
  res.render("generateQuiz");
});

// Endpoint to display all categories
app.get("/categories", logged_in_check, async (req, res) => {
  try {
    const [categories] = await connection
      .promise()
      .query("SELECT * FROM Categories");
    res.render("categories", { categories }); // Pass the categories to the EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the categories.");
  }
});

// Endpoint to display questions for a category
app.get("/category/:category_id/questions", logged_in_check, async (req, res) => {
  const { category_id } = req.params;
  try {
    const [questions] = await connection
      .promise()
      .query("SELECT * FROM Questions WHERE category_id = ?", [category_id]);
    // Include options for each question
    for (const question of questions) {
      const [options] = await connection
        .promise()
        .query("SELECT * FROM Options WHERE question_id = ?", [
          question.question_id,
        ]);
      question.options = options;
    }
    res.render("questions", { questions }); // Ensure you have a 'questionsPage.ejs' file in your views directory
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching questions.");
  }
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
