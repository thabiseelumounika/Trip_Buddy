
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.startsWith('gsk_')) {
    console.log('Not a Groq key:', apiKey);
    return;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a professional travel planner.' },
        { role: 'user', content: 'Test prompt' }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

test();
