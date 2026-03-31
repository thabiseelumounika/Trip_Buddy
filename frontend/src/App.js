import React, { useState } from "react";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";
import Booking from "./components/Booking";
import ReviewFeedback from "./components/ReviewFeedback";
import "./index.css";

const translations = {
  English: {
    welcome: "TripBuddy",
    desc: "Your Personal Virtual Travel Assistant. We use Artificial Intelligence to provide complete, curated travel guidance including destination suggestions, budget estimation, weather conditions, local food, and hotels—tailored exactly for you.",
    startBtn: "Start Planning with AI ✨",
    dashboard: "Dashboard",
    reviews: "Reviews"
  },
  Telugu: {
    welcome: "TripBuddy",
    desc: "మీ వ్యక్తిగత వర్చువల్ ట్రావెల్ అసిస్టెంట్. మేము మీ కోసం గమ్యస్థాన సూచనలు, బడ్జెట్ అంచనా, వాతావరణ పరిస్థితులు, స్థానిక ఆహారం మరియు హోటళ్లతో సహా పూర్తి, క్యూరేటెడ్ ప్రయాణ మార్గదర్శకత్వాన్ని అందించడానికి కృత్రిమ మేధస్సును ఉపయోగిస్తాము.",
    startBtn: "AI తో ప్లాన్ చేయడం ప్రారంభించండి ✨",
    dashboard: "డ్యాష్‌బోర్డ్",
    reviews: "సమీక్షలు"
  },
  Hindi: {
    welcome: "TripBuddy",
    desc: "आपका व्यक्तिगत वर्चुअल ट्रैवल असिस्टेंट। हम आपके लिए गंतव्य सुझाव, बजट अनुमान, मौसम की स्थिति, स्थानीय भोजन और होटल सहित पूर्ण, क्यूरेटेड यात्रा मार्गदर्शन प्रदान करने के लिए कृत्रिम बुद्धिमत्ता का उपयोग करते हैं।",
    startBtn: "AI के साथ योजना बनाना शुरू करें ✨",
    dashboard: "डैशबोर्ड",
    reviews: "समीक्षाएं"
  },
  Others: {
    welcome: "TripBuddy",
    desc: "Your Personal Virtual Travel Assistant. We use Artificial Intelligence to provide complete, curated travel guidance including destination suggestions, budget estimation, weather conditions, local food, and hotels—tailored exactly for you.",
    startBtn: "Start Planning with AI ✨",
    dashboard: "Dashboard",
    reviews: "Reviews"
  }
};

function App() {
  // All states start as false → Home page is shown by default on startup
  const [startPlanning, setStartPlanning] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [language, setLanguage] = useState("English");

  const t = translations[language] || translations["English"];

  const goHome = () => {
    setStartPlanning(false);
    setShowDashboard(false);
    setShowReviews(false);
    setShowBooking(false);
  };

  // Determine which page to show
  const isHome = !startPlanning && !showDashboard && !showReviews && !showBooking;

  return (
    <div className="app">
      {/* Home Page */}
      {isHome && (
        <>
          {/* Navbar */}
          <div className="navbar">
            <div className="nav-buttons">
              <button onClick={goHome}>🏠 Home</button>

              <select
                className="language-select-btn"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">🌍 English</option>
                <option value="Telugu">🌍 Telugu</option>
                <option value="Hindi">🌍 Hindi</option>
                <option value="Others">🌍 Others</option>
              </select>

              <button onClick={() => { setShowDashboard(true); setShowReviews(false); }}>
                📊 {t.dashboard}
              </button>

              <button onClick={() => { setShowReviews(true); setShowDashboard(false); }}>
                ⭐ {t.reviews}
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="hero">
            <h1>{t.welcome}</h1>
            <p>{t.desc}</p>
            <button className="cta" onClick={() => setStartPlanning(true)}>
              {t.startBtn}
            </button>
          </div>
        </>
      )}

      {/* Dashboard Page */}
      {showDashboard && (
        <Dashboard
          onBack={goHome}
          language={language}
        />
      )}

      {/* Booking Page */}
      {showBooking && (
        <Booking
          onBack={() => { setShowBooking(false); setStartPlanning(false); }}
          tripDetails={tripData}
        />
      )}

      {/* Reviews Page */}
      {showReviews && (
        <div style={{ height: "100vh", overflowY: "auto", padding: "2rem 0" }}>
          <button
            className="back-btn"
            onClick={goHome}
            style={{ position: "fixed", top: "20px", left: "20px", zIndex: 100 }}
          >
            ← Back
          </button>
          <ReviewFeedback />
        </div>
      )}

      {/* Chatbot Page */}
      {startPlanning && !showBooking && (
        <Chatbot
          onBack={goHome}
          onBookTickets={(data) => { setTripData(data); setShowBooking(true); }}
          language={language}
        />
      )}
    </div>
  );
}

export default App;
