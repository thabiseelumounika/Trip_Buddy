# Trip_Buddy


**Tripbuddy** is a modern, AI-powered travel planning and booking platform designed to make your journey seamless, affordable, and personalized. Built with a stunning **Dark Glassmorphism** aesthetic, it provides a premium experience from initial research to final booking.

## ✨ Key Features

### 🤖 AI-Powered Travel Planning
- **Multi-language Chatbot**: Plan your trip in English, Telugu, or Hindi.
- **Intelligent Itineraries**: Generates curated travel plans, weather reports, and food suggestions.
- **Dynamic Exploration**: View Wikipedia-based photos and detailed descriptions of your destination.
- **Improved Visuals**: Features high-quality "Coming Soon" placeholders for places without immediate live image availability.

### 🎫 Integrated Booking System
- **Transport Selection**: Book Trains, Buses, Aeroplanes, or Taxis with specific sub-type selection.
- **Hotel Booking with Ratings**: Choose from 5 tiers of accommodation (Hostel to 5-Star) with live **star ratings** and detail summaries.
- **Round-Trip Support**: Easily add return tickets with automatic return date estimation based on your trip length.
- **Budget Validation**: Real-time alerts if your transport or hotel selections exceed your planned budget.

### 📊 Travel Dashboard
- **Planned Trips**: A persistent history of your AI-generated travel plans, including full itineraries.
- **Confirmed Bookings**: A dedicated section to view your upcoming transport and hotel booking receipts.
- **History Management**: Easily view, expand, or clear your trip history securely saved in local storage.

### 🌟 Experience & Feedback
- **Global Reviews**: A dedicated reviews page to see and share feedback from our global community of travelers.
- **Trip-Specific Ratings**: Share your direct experience at the end of each booking journey.

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern component-based architecture.
- **Vanilla CSS**: Custom **Glassmorphism** design system with sleek animations.
- **Local Storage**: Secure client-side data persistence for history and sessions.

### Backend
- **Node.js & Express.js**: Fast and scalable server logic.
- **OpenAI API**: Powering the intelligent, multi-lingual travel assistant.
- **Wikipedia API**: Live fetching of travel spot descriptions and images.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your machine.
- An OpenAI API key.

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your OPENAI_API_KEY
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🛤️ Future Roadmap
- [ ] **Persistent Database**: Transition from Local Storage to MongoDB for account-based history.
- [ ] **Real Payment Gateway**: Integrate Stripe or Razorpay for live transactions.
- [ ] **Live APIs**: Connect with real-time flight, hotel, and weather data.
- [ ] **Mobile App**: Launch a mobile version using React Native.

---
