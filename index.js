const express = require("express");
const multer = require("multer");
const openai = require("openai");
const path = require("path");
const mysql = require('mysql2');

// connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Stuccosong88',
  database: 'generative_ai'
});

// Connect to MySQL
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');
});

require("dotenv").config();

const app = express();
const upload = multer();
const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/get_questions", upload.single("notes"), async function (req, res) {
  try {
    // Extract data from the request
    const notesFile = req.file;
    const notes = notesFile.buffer.toString();
    const subject = req.body.subject;
    const num_ques = req.body.num_ques;

    // Define the prompt for GPT-4
    const prompt = `Generate ${num_ques} questions with multiple-choice answers based on the following notes for the subject '${subject}'.`;

    // Call GPT-4 to generate questions
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: prompt },
        { role: "system", content: "Here are the notes:\n" + notes }
      ],
    });

    // Parse the returned questions
    const generatedQuestions = JSON.parse(completion.choices[0].message.content).quiz;

     // Assuming the language is always English!!!
     const [languages] = await connection.promise().query('SELECT language_id FROM Languages WHERE language_name = ?', ['English']);
     const languageId = languages[0].language_id;
 
     // Get the category ID based on the subject
     const [categories] = await connection.promise().query('SELECT category_id FROM Categories WHERE category_name = ?', [subject]);
     const categoryId = categories[0].category_id;

    // Insert the generated questions and options into the database
    for (const questionObj of generatedQuestions) {
      const questionText = questionObj.question;
      const choices = questionObj.choices;
      const correctAnswer = questionObj.answer;

      // Start a database transaction
      await connection.promise().beginTransaction();

      // Insert the question
      const [questionResult] = await connection.promise().query(
        'INSERT INTO Questions (category_id, language_id, question_text) VALUES (?, ?, ?)',
        [/* category_id */, /* language_id */, questionText]
      );

      const questionId = questionResult.insertId;

      // Insert the options
      for (const choice of choices) {
        const isCorrect = choice === correctAnswer;
        await connection.promise().query(
          'INSERT INTO Options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
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


app.get("/questions", (req, res) => {
  const dummyQuestions = [
    { question: "What is the capital of France?" },
    { question: "What is the largest planet in our solar system?" },
  ];
  res.render("questionStack", { questions: dummyQuestions });
});

app.get("/", (req, res) => {
  res.render("landingPage");
});

app.get("/generate-quiz", (req, res) => {
  res.render("generateQuiz");
});

app.get('/categories', (req, res) => {
  res.render('categories'); 
});

// Endpoint to display all categories
app.get('/categories', async (req, res) => {
  try {
    const [categories] = await connection.promise().query('SELECT * FROM Categories');
    res.render('categories', { categories }); // Pass the categories to the EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the categories.");
  }
});


// Endpoint to display questions for a category
app.get('/category/:category_id/questions', async (req, res) => {
  const { category_id } = req.params;
  try {
    const [questions] = await connection.promise().query('SELECT * FROM Questions WHERE category_id = ?', [category_id]);
    // Include options for each question
    for (const question of questions) {
      const [options] = await connection.promise().query('SELECT * FROM Options WHERE question_id = ?', [question.question_id]);
      question.options = options;
    }
    res.render('questionsPage', { questions }); // Ensure you have a 'questionsPage.ejs' file in your views directory
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching questions.");
  }
});


app.get("/", function (req, res) {
  res.send("Hi from express");
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
