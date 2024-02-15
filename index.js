import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server as SocketIO } from 'socket.io';
import nodeFetch from 'node-fetch';
import express from "express";
import multer from "multer";
import path from "path";
import authRouter from "./routes/auth.js"
import DatabaseConnection from "./utilities/database_connection.js"
import logged_in_check from "./utilities/logged_in_check_middleware.js";
import generateImages from "./utilities/dalleClient.js";
import generateQues from "./utilities/gptClient.js";
import generateQuesPlaces from "./utilities/gptClient_places.js";


// const connection = new DatabaseConnection()

// For operations related to the generative_ai database
const generativeAiDbConnection = DatabaseConnection.getConnection("generative_ai");

// For operations related to the places database
const placesDbConnection = DatabaseConnection.getConnection("places");


const app = express();
const upload = multer();

// creates HTTP server and attach the Express app to it
const httpServer = createServer(app); 
const io = new SocketIO(httpServer);
app.use(express.json()); // This line should be placed before your routes

app.set("view engine", "ejs");
app.set("views", [
  path.join(path.resolve(), "views"),
  path.join(path.resolve(), "places", "views")
]);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/places", express.static(path.join(path.resolve(), "places", "public")));


// WebSocket connections handling //
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket.');

  socket.on('playerJoined', (data) => {
      // when a player joins the game
      console.log(`Player joined: ${data.nickname}`);
      // broadcast join event to all clients (including host)
      io.emit('playerJoined', data);
  });

  socket.on('joinGameRequest', () => {
      console.log('Join game request received');
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});



app.use("/", authRouter);

  app.post("/get_questions", logged_in_check, upload.none(), async function (req, res) {
  try {
    // Extract data from the request 
    const subject = req.body.subject;
    const num_ques = req.body.num_ques;

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





/// PLACES STARTS HERE ///

app.get("/places", (req, res) => {
  res.render("places");
});

// server HOST for places
app.get('/mainGameMultiplayerHost', (req, res) => {
  res.render('main-game-multiplayer-host');
});


// CLIENT //
app.get('/mainGameMultiplayerClient', (req, res) => {
  res.render('multiplayer-client');
});


// Endpoint to fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
      // Fetch categories from the database
      const [categories] = await placesDbConnection.promise().query("SELECT * FROM categories");
      res.json(categories);
  } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Error fetching categories.');
  }
});


// Adjust the `generateQuestionsForCategory` function to also fetch and send back the image URL.
app.post('/places/generate_questions', async (req, res) => {
  const { category, num_questions } = req.body;

  try {
      const questions = await generateQuesPlaces(category, num_questions);
      const answer = questions[0].answer;

      // Use the answer to call the Google Places API to find place_id
      const apiKey = 'AIzaSyC_A69xm_kHQZZqPS_qrVqXcf26OUFryWc';
      const inputType = 'textquery';
      const input = encodeURIComponent(answer);
      const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?inputtype=${inputType}&input=${input}&key=${apiKey}`;

      const placeResponse = await fetch(findPlaceUrl);
      const placeJson = await placeResponse.json();

      if (placeJson.candidates.length > 0) {
          const placeId = placeJson.candidates[0].place_id;

          // Fetch the image URL using the place_id
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=photo&key=${apiKey}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsJson = await detailsResponse.json();

          if (detailsJson.result.photos && detailsJson.result.photos.length > 0) {
              const photoReference = detailsJson.result.photos[0].photo_reference;
              const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;

              // Send back the question, answer, place_id, and photo URL
              res.json({ questions, photoUrl });
          } else {
              throw new Error('No photos found for this place');
          }
      } else {
          throw new Error('No candidates found for the given location.');
      }
  } catch (error) {
      console.error('Failed to generate questions or fetch place ID/image:', error);
      res.status(500).send('Failed to generate questions or fetch place ID/image.');
  }
});





/// PLACES ENDS HERE ///



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
httpServer.listen(port, () => {
  console.log("Running on port " + port);
});
