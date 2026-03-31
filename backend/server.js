import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
const isGroq = apiKey && apiKey.startsWith("gsk_");

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: isGroq ? "https://api.groq.com/openai/v1" : undefined,
});

// ✅ Chat API
app.post("/chat", async (req, res) => {
  try {
    const { data } = req.body;
    console.log("Request received for travel plan:", data);

    const prompt = `
You are a highly intelligent, friendly, and expert Travel Agent AI.
A user has requested a travel plan with the following details:
- Starting Point (Origin): ${data.startingPoint}
- Destination: ${data.destination}
- Season/Month: ${data.season}
- Number of Days: ${data.days}
- Total Budget: ${data.budget}
- Number of Members: ${data.members}

Please generate a detailed, beautifully formatted travel plan in Markdown.
In your response, you MUST include the following sections and information, each starting with a '##' heading:
## 📊 Welcome & Introduction
A brief enthusiastic greeting and the benefits of visiting this destination in the specified season.

## 🗺️ Best Places to Visit
According to the season. List each attraction as a bullet point:
- **Place Name**: [View on Google Maps](URL) - Brief description of why to visit.

## 🚗 How to Reach ${data.destination} from ${data.startingPoint}
Suggest the best travel routes and modes of transport (Bus, Train, Car, Bike, Flight) from ${data.startingPoint} to ${data.destination}, including approximate journey time and cost.

## 🚲 Local Transport at ${data.destination}
How to get around once there.

## 💰 Estimated Cost Breakdown
Give a rough estimate of total cost per person (including travel from ${data.startingPoint}) out of the given budget.

## ⛅ Expected Weather Details
Typical weather at ${data.destination} during the specified season.

## 👗 Dressing Suggestions
What clothes to pack based on the weather.

## 🍴 Famous Local Food
- **Dish Name**: Description/Specialty.
(Separate into Vegetarian and Non-Vegetarian sub-sections using '###')

## 🛍️ Shopping
Best local markets, bazaars, and things to buy as souvenirs. Use bullet points:
- **Market Name**: What to buy.

## 🏨 Available Hotels/Accommodation
Recommend some general types or specific popular areas to stay.

## 📍 Important Tourist Attractions
List the top attractions using this EXACT format for each:
- **Attraction Name**: [View on Google Maps](https://www.google.com/maps/search/?api=1&query=Insert+Attraction+Name) - Quick highlight.

## 🚨 Travel Tips
Any important tips specific to travelling from ${data.startingPoint} to ${data.destination}.

*IMPORTANT: DO NOT include any image placeholders, icons (like 🖼️), "View Image" text, or markdown image links (![...](...)). ONLY provide text and Google Maps links. Make the response visually appealing using bolding, lists, emojis (except image-related ones), and headings.*
`;

    const completion = await openai.chat.completions.create({
      model: isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional travel planner." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Error generating travel plan:", error);
    res.status(500).json({ reply: "❌ Oops! Something went wrong on the server while communicating with the AI. Please try again." });
  }
});

// ✅ AI Input Validation API (for questionnaire phase)
app.post("/validate", async (req, res) => {
  try {
    const { input, question, language } = req.body;
    console.log("Validating input:", input, "for question:", question);

    const validationPrompt = `
You are a Travel Assistant Input Validator.
The user was asked: "${question}"
The user replied: "${input}"

STRICT RULES:
1. If the user's response is a greeting like "hi", "hello", "hey", "hlo", or localized versions, it MUST be marked as GREETING.
2. If the user's response is completely unrelated to travel or the question (e.g., "explain python", "tell me a joke", "what is 2+2"), it MUST be marked as UNRELATED.
3. Only mark as VALID if the response actually attempts to answer the specific question "${question}".

Response format: Respond with ONLY the word VALID, GREETING, or UNRELATED.
Do NOT provide any explanation or extra text.
`;

    const completion = await openai.chat.completions.create({
      model: isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a specialized input classifier." },
        { role: "user", content: validationPrompt }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const result = completion.choices[0].message.content.trim().toUpperCase();
    console.log("Validation result:", result);
    res.json({ result: result });

  } catch (error) {
    console.error("Error in validation:", error);
    // If AI fails, default to VALID to avoid blocking the user
    res.json({ result: "VALID" });
  }
});

// ✅ Follow-up Q&A API (tourist-only guard)
app.post("/followup", async (req, res) => {
  try {
    const { question, context } = req.body;
    console.log("Follow-up question received:", question);

    const systemPrompt = `You are a friendly and knowledgeable AI Tourist Assistant. Your ONLY job is to answer questions related to travel, tourism, tourist places, hotels, food, transport, weather, culture, shopping, and travel tips.

The user has already planned a trip:
- From: ${context.startingPoint || "Unknown"}
- To: ${context.destination || "Unknown"}
- Season: ${context.season || "Unknown"}
- Days: ${context.days || "Unknown"}
- Budget: ${context.budget || "Unknown"}
- Members: ${context.members || "Unknown"}

STRICT RULES:
1. ONLY answer questions about travel, tourism, tourist places, food, hotels, weather, local culture, transport, or shopping.
2. If the user asks ANYTHING unrelated to travel or tourism (e.g., coding, politics, sports scores, homework, health advice, etc.), respond ONLY with this message: "🧳 I'm your dedicated Tourist Assistant! I can only help with travel and tourism-related questions. Please ask me about tourist places, food, hotels, transport, weather, or travel tips for your trip!"
3. Be helpful, friendly, and use emojis where appropriate.
4. Format answers in Markdown with bullet points, bold text, and headings where helpful.
5. IMPORTANT: DO NOT include any image placeholders, icons (like 🖼️), "View Image" text, or markdown image links (![...](...)). ONLY provide text and Google Maps links.`;

    const completion = await openai.chat.completions.create({
      model: isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Error in follow-up response:", error);
    res.status(500).json({ reply: "❌ Oops! Something went wrong. Please try again." });
  }
});

// ✅ In-memory reviews storage
const reviews = [];

// ✅ Submit a review
app.post("/reviews", (req, res) => {
  try {
    const { destination, name, rating, review } = req.body;
    if (!destination || !name || !rating || !review) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const newReview = {
      destination,
      name,
      rating: parseInt(rating, 10),
      review,
      date: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    console.log("Review submitted:", newReview);
    res.json({ review: newReview });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review." });
  }
});

// ✅ Get reviews for a destination
app.get("/reviews", (req, res) => {
  const dest = (req.query.destination || "").toLowerCase();
  const filtered = dest
    ? reviews.filter((r) => r.destination.toLowerCase() === dest)
    : reviews;
  res.json({ reviews: filtered });
});

// ✅ Server start
app.listen(5001, () => {
  console.log("Server running on port 5001");
});