import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const gptClient = new OpenAI({
  apiKey: "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",
});

export default async function generateQuesPlaces(category, num_questions) {
  if (!category) {
    console.error("Category is undefined.");
    return [];
  }

  const messages = [
    {
      role: "system",
      content: `You are a trivia question creator. Your job is to generate 1 trivia question at a time based on the selected category, BUT
      the questions must be based on places, like locations ONLY. The answers to these questions have to exist so that Google can
      find an image of them. Give the answers as well and make it return JSON.`,
    },
    {
      role: "user",
      content: `Generate ${num_questions} questions with multiple-choice answers based on the topic: '${category}'. Each question should be different.
      Try to come up with different answers as much as you can.
      For example and this is JUST AN EXAMPLE, do not copy this, if the category is North American National Parks (this should include ALL national parks
        in Canada and the United States of America), then a potential
      sample question could be Which national park is famous for its biodiversity and is also known as the “International Biosphere Reserve”?
      And the options might be A) Great Smoky Mountains National Park, B) Yellowstone National Park
      C) Thaddeus Kosciuszko National Memorial D) The Grand Canyon  `,
    },
    {
      role: "system",
      content: `Here is the topic:\n${category}`,
    },
    {
      role: "system",
      content: `The format for each question should be a clear, concise question followed by four multiple-choice options, with one correct answer marked. Don't say anything else, only valid JSON output.`,
    },
    {
      role: "system",
      content: `Make sure the JSON is like this: quiz: [{question: "", choices: [], answer: ""}]`,
    },
    {
      role: "system",
      content: `Please only valid JSON output, DO NOT SAY ANYTHING ELSE, only JSON.`,
    },
    {
      role: "system",
      content: `Here is the topic:\n${category}`,
    },
  ];
  // Call GPT-4 to generate questions
  const completion = await gptClient.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });
  // Log the GPT-4 completion content
  console.log(
    "GPT-4 Completion Content:",
    completion.choices[0].message.content
  );

  // Parse the returned questions
  const generatedQuestions = JSON.parse(
    completion.choices[0].message.content
  ).quiz;

  return generatedQuestions;
}
