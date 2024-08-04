// api/fetchRecipes.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
      });

      // Parse the response into an array of recipes
      const recipesText = response.data.choices[0].text.trim();
      const recipes = recipesText.split('\n').filter(line => line.trim() !== '');

      res.status(200).json({ recipes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
