const express = require("express");
const multer = require("multer");
const openai = require("openai");
const path = require('path');

require("dotenv").config();

const app = express();
const upload = multer();
const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.post("/get_questions", upload.single("notes"), async function (req, res) {
  const notesFile = req.file;
  const notes = notesFile.buffer.toString();

  const completion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a quiz questions creator. Your job is to generate quiz questions based on the inputted notes. Give the answers as well and make it return JSON",
      },
      {
        role: "user",
        content: "You need to generate 20 questions",
      },
      {
        role: "system",
        content: "The subject for the notes is math.",
      },
      {
        role: "system",
        content: "Here's the notes:\n" + notes,
      },
    ],
    model: "gpt-4",
  });

  res.json(JSON.parse(completion.choices[0].message.content));
});

app.get('/questions', (req, res) => {
  const dummyQuestions = [
    { content: 'What is the capital of France?' },
    { content: 'What is the largest planet in our solar system?' }
  ];
    res.render('questionStack', { questions: dummyQuestions });
  });


app.get('/', (req, res) => {
  res.render('landingPage');
});

app.get('/generate-quiz', (req, res) => {
  res.send('Quiz generation page will go here.');
});

app.get("/", function (req, res) {
  res.send("Hi from express");
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
