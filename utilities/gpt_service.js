import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const gptClient = new OpenAI({ apiKey: process.env.GPT_API_KEY });

export default async function generateQues(subject, num_ques) {
  // Define the prompt for GPT-4
  const messages = [
    {
      role: "system",
      content: `You are a quiz question creator. Your job is to generate quiz questions based on the inputted 
                topic. Give the answers as well and make it return JSON.`,
    },
    {
      role: "user",
      content: `Generate ${num_ques} questions with multiple-choice answers based on the topic: '${subject}'. 
                Each question should be different. After each question, include an instruction to display a 
                DALL-E 2-generated image related to the question.`,
    },
    {
      role: "system",
      content: `The format for each question should be a clear, concise question followed by four 
                multiple-choice options, with one correct answer marked. Don't say anything else, only valid JSON output.`,
    },
    {
      role: "system",
      content: `Example format:
            Question: Identify this US president.
            Image: [URL to DALL-E 2-generated image]
            Options: A) George Washington, B) Thomas Jefferson, C) Abraham Lincoln, D) Theodore Roosevelt
            Answer: C`,
    },
    {
      role: "system",
      content: `Make sure the JSON is like this: quiz: [{question: "", image: "", choices: [], answer: ""}]`,
    },
    {
      role: "system",
      content: `Please only valid JSON output, DO NOT SAY ANYTHING ELSE, only JSON.`,
    },
    {
      role: "system",
      content: `Here is the topic:\n${subject}`,
    },
  ];

  // Call GPT-4 to generate questions
  const completion = await gptClient.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });

  // Log the GPT-4 completion content
  // console.log("GPT-4 Completion Content:", completion.choices[0].message.content);

  // Parse the returned questions
  const generatedQuestions = JSON.parse(
    completion.choices[0].message.content
  ).quiz;

  return generatedQuestions;
}
