import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const gptClient = new OpenAI({ apiKey: "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" });

// Assuming OpenAI and dotenv are correctly imported and configured as shown in your snippet

export default async function generateQues(category, num_ques) {
    const messages = [
        {
            role: "system",
            content: `You are a trivia question creator. Your job is to generate one trivia question at a time based on the selected category. Give the answers as well and make it return JSON.
            Do not generate another one until the user has clicked the next button`,
        },
        {
            role: "user",
            content: `Generate ${num_ques} questions with multiple-choice answers based on the topic: '${category}'. Each question should be different.
            For example, if the category is North American National Parks, then a potential
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

    

    try {
        const completion = await gptClient.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        });

        // Parse the returned questions
        const generatedQuestions = JSON.parse(completion.choices[0].message.content).quiz;

        // Print questions, options, and correct answers to console
        generatedQuestions.forEach(question => {
            console.log(`Question: ${question.question}`);
            console.log(`Options: ${question.choices.join(', ')}`);
            console.log(`Correct Answer: ${question.answer}`);
        });

        return generatedQuestions;
    } catch (error) {
        console.error("Error generating questions with GPT:", error);
        return []; // Return an empty array or handle as needed
        
    }
}