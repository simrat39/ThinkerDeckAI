import express from "express";
import multer from "multer";
import path from "path";
import authRouter from "./routes/auth.js";
import logged_in_check from "./utilities/logged_in_check_middleware.js";
import generateImages from "./utilities/dalle_service.js";
import generateQues from "./utilities/gpt_service.js";
import MongoService from "./utilities/mongo_service.js";

const mongo = new MongoService();
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
      const category = req.body.category;
      const title = req.body.title;
      const num_ques = req.body.num_ques;

      console.log(category, title, num_ques);

      // validate input parameters
      if (category == "" || num_ques == "" || title == "") {
        res.send(`
        <script>
            alert("Form fields cannot be empty.");
            window.location.reload();
        </script>
    `);
        return;
      }

      // Generate questions through GPT-4
      let generatedQuestions = await generateQues(category, title, num_ques);

      console.log(generatedQuestions);

      // Generate images through DALL-E 2
      const generatedImages = await generateImages(generatedQuestions);

      // append image URLS to respective questions
      for (let i = 0; i < generatedQuestions.length; i++) {
        generatedQuestions[i].image = generatedImages[i];
      }

      // Add category to mongodb
      const mongo_category = await mongo.add_category(category);

      // save quiz to database
      await mongo.save_quiz(mongo_category, title, generatedQuestions);

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
    {
      question: "Which champion is known as the 'Might of Demacia'?",
      image:
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-gXH6hy6CWuqXBIya1dQTji9B/user-0k86RrGYAA47himXlMXUfvC0/img-Wh4y7AX7PMM7JBhN2a2zdc0a.png?st=2024-02-15T21%3A14%3A11Z&se=2024-02-15T23%3A14%3A11Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-02-15T22%3A14%3A11Z&ske=2024-02-16T22%3A14%3A11Z&sks=b&skv=2021-08-06&sig=7ApoaG5Q7tup0MD6fTRyWreNDR1PDA0NAmGlGIjQhm0%3D",
      choices: ["A) Garen", "B) Ashe", "C) Akali", "D) Twisted Fate"],
      answer: "A) Garen",
    },
    {
      question: "What is the default map in League of Legends called?",
      image:
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-gXH6hy6CWuqXBIya1dQTji9B/user-0k86RrGYAA47himXlMXUfvC0/img-GdygcNMCg6DtGYgSMWXReQMw.png?st=2024-02-15T21%3A14%3A21Z&se=2024-02-15T23%3A14%3A21Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-02-15T02%3A27%3A58Z&ske=2024-02-16T02%3A27%3A58Z&sks=b&skv=2021-08-06&sig=TnrJA509jDTAZjDf9pXLhT2QlqR8Oa8tUqgSfgr26Gk%3D",
      choices: [
        "A) Crystal Scar",
        "B) Howling Abyss",
        "C) Twisted Treeline",
        "D) Summoner's Rift",
      ],
      answer: "D) Summoner's Rift",
    },
    {
      question:
        "Which League of Legends champion has a passive ability called 'Cursed Touch'?",
      image:
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-gXH6hy6CWuqXBIya1dQTji9B/user-0k86RrGYAA47himXlMXUfvC0/img-gJ4SQQcD3iFBQHzp2UGkwFvz.png?st=2024-02-15T21%3A14%3A30Z&se=2024-02-15T23%3A14%3A30Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-02-15T16%3A20%3A06Z&ske=2024-02-16T16%3A20%3A06Z&sks=b&skv=2021-08-06&sig=ujHYoeVGafKTuhgp1TuuuumRAmyGjMc2ZqqRthiu3eI%3D",
      choices: ["A) Teemo", "B) Amumu", "C) Ivern", "D) Poppy"],
      answer: "B) Amumu",
    },
    {
      question:
        "What is the maximum level a champion can reach in-game in a standard match?",
      image:
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-gXH6hy6CWuqXBIya1dQTji9B/user-0k86RrGYAA47himXlMXUfvC0/img-W7cYloC4ZE362J5e6uG67edv.png?st=2024-02-15T21%3A14%3A40Z&se=2024-02-15T23%3A14%3A40Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-02-15T16%3A56%3A49Z&ske=2024-02-16T16%3A56%3A49Z&sks=b&skv=2021-08-06&sig=yPyOOGSYiuDsW%2BLz1pMkw5LoZRWEOOwOcy%2BJoSg5y5E%3D",
      choices: ["A) 15", "B) 16", "C) 17", "D) 18"],
      answer: "D) 18",
    },
    {
      question: "What is the name of the dragon that grants an infernal buff?",
      image:
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-gXH6hy6CWuqXBIya1dQTji9B/user-0k86RrGYAA47himXlMXUfvC0/img-5hDlzMl2ripKglyqoWAtNPmb.png?st=2024-02-15T21%3A14%3A49Z&se=2024-02-15T23%3A14%3A49Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-02-15T14%3A51%3A23Z&ske=2024-02-16T14%3A51%3A23Z&sks=b&skv=2021-08-06&sig=KkY8vdDdIqJU86wLFVZpYDnUdyUP%2Bt8rrM3139xdKZ0%3D",
      choices: [
        "A) Cloud Drake",
        "B) Mountain Drake",
        "C) Ocean Drake",
        "D) Infernal Drake",
      ],
      answer: "D) Infernal Drake",
    },
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

// // Endpoint to display all categories
app.get("/quizzes", logged_in_check, async (req, res) => {
  try {
    const quizzes = await mongo.get_all_quizzes();
    res.render("quizzes", { quizzes });
  } catch (e) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the quizzes.");
  }
});

// // Endpoint to display questions for a category
app.get("/quizzes/:quiz_id", logged_in_check, async (req, res) => {
  const { quiz_id } = req.params;
  const quiz = await mongo.get_quiz(quiz_id);
  const questions = quiz.questions

  res.render("questions", { questions });
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
