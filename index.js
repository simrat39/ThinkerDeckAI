import express from "express";
import multer from "multer";
import path from "path";
import authRouter from "./routes/auth.js";
import { DatabaseClient } from "./utilities/databaseClient.js";
import logged_in_check from "./utilities/logged_in_check_middleware.js";
import generateImages from "./utilities/dalleClient.js";
import generateQues from "./utilities/gptClient.js";

const connection = new DatabaseClient();
//console.log(connection);
const app = express();
const upload = multer();

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/", authRouter);

app.post(
  "/get_questions",
  logged_in_check,
  upload.none(),
  async function (req, res) {
    try {
      // Extract data from the request
      const subject = req.body.subject;
      const num_ques = req.body.num_ques;

      // validate input parameters
      if (subject == "" || num_ques == "") {
        res.send(`
        <script>
            alert("Form fields cannot be empty.");
            window.location.reload();
        </script>
    `);
        return;
      }

      // Generate questions through GPT-4
      let generatedQuestions = await generateQues(subject, num_ques);

      // Generate images through DALL-E 2
      const generatedImages = await generateImages(generatedQuestions);

      // append image URLS to respective questions
      for (let i = 0; i < generatedQuestions.length; i++) {
        generatedQuestions[i].image = generatedImages[i];
      }

      // save quiz to database
      // await connection.saveQuiz(subject, generatedQuestions);

      // Render the question stack view with the generated questions
      res.render("questionStack", { questions: generatedQuestions });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while generating the questions.");
    }
  }
);

app.get("/questions", logged_in_check, (req, res) => {
  const dummyQuestions = [
    { question: "What is the capital of France?" },
    { question: "What is the largest planet in our solar system?" },
  ];
  res.render("questionStack", { questions: dummyQuestions });
});

app.get("/", (req, res) => {
  console.log(!!req.user);
  res.render("landingPage", { loggedIn: !!req.user });
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
app.get(
  "/category/:category_id/questions",
  logged_in_check,
  async (req, res) => {
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
  }
);

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
