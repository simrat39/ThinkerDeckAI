import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const dalleClient = new OpenAI({ apiKey: process.env.DALLE_API_KEY });

export default async function generateImages(questions) {
    try {
        let image_urls = [];
        let answers = [];
        for (const question of questions) {
            const answer = (question.answer).slice(3);
            answers.push(answer);
            const response = await dalleClient.images.generate({
                model: "dall-e-2",
                prompt: `a photograph of ${answer}. If the answer is a number, 
                        generate a decent generic image for maths.`,
                n: 1,
                size: "1024x1024",
            });
            const url = response.data[0].url;
            image_urls.push(url);
            console.log("image url type: " + typeof url);
            console.log("image url: " + JSON.stringify(url));
            
        }
        console.log("answers: " + answers);
        return image_urls;
    } catch (error) {
        console.error("Error generating images:", error);
        throw error;
    }
}