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
  try {
    const notesFile = req.file;
    const notes = notesFile.buffer.toString();
    const subject = req.body.subject;
    const num_ques = req.body.num_ques;

    const messages = [
      {
        role: "system",
        content: "You are a quiz questions creator. Your job is to generate quiz questions based on the inputted notes. Give the answers as well and make it return JSON."
      },
      {
        role: "user",
        content: `Generate ${num_ques} questions with multiple-choice answers based on the following notes for the subject '${subject}'.`
      },
      {
        role: "system",
        content: "The format for each question should be a clear, concise question followed by four multiple-choice options, with one correct answer marked. Don't say anything else, only valid json output."
      },
      {
        role: "system",
        content: `Example format:
        Question: This legendary boxer was originally named Cassius Clay.
        Options: A) Joe Frazier, B) Sugar Ray Leonard, C) Muhammad Ali, D) George Foreman
        Answer: C`
      },
      {
        role: "system",
        content: `Make sure the json is like this: quiz: [{question: "", choices: [], answer: ""}]`
      },
      {
        role: "system",
        content: `Here are the notes:\n${notes}`
      }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

  //   const questions = JSON.parse(completion.choices[0].message.content);
  //   res.json(questions);

  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("An error occurred while generating the questions.");
  // }


  const generatedQuestions = JSON.parse(completion.choices[0].message.content);
  console.log(generatedQuestions)
  res.render('questionStack', { questions: generatedQuestions.quiz }); // Render the questions on the questionStack view
} catch (error) {
  console.error(error);
  res.status(500).send("An error occurred while generating the questions.");
}
});
  




app.get('/questions', (req, res) => {
  const dummyQuestions = [
    { question: 'What is the capital of France?' },
    { question: 'What is the largest planet in our solar system?' }
  ];
    res.render('questionStack', { questions: dummyQuestions });
  });


app.get('/', (req, res) => {
  res.render('landingPage');
});

app.get('/generate-quiz', (req, res) => {
  res.render('generateQuiz')
});

app.get("/", function (req, res) {
  res.send("Hi from express");
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
