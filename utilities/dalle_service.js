import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const dalleClient = new OpenAI({ apiKey: process.env.DALLE_API_KEY });

export default async function generateImages(questions) {
  try {
    let image_urls = [];
    for (const question of questions) {
      const answer = question.answer.slice(3);
      const response = await dalleClient.images.generate({
        model: "dall-e-2",
        prompt: `a photograph of ${answer}. If the answer is a number, 
                        generate a decent generic image for maths.`,
        n: 1,
        size: "1024x1024",
      });
      const url = response.data[0].url;
      image_urls.push(url);
    }
    return image_urls;
  } catch (error) {
    throw error;
  }
}
