const express = require("express");
const multer = require("multer");
const openai = require("openai");

require("dotenv").config();

const app = express();
const upload = multer();
const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API });

app.use(express.json());

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
    // response_format: { type: "json_object" },
    model: "gpt-4",
  });

  res.json(JSON.parse(completion.choices[0].message.content))
});

app.get("/", function (req, res) {
  res.send("Hi from express");
});

const port = 8000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
