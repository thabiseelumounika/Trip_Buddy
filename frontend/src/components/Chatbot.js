import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function Chatbot({ onBack, onBookTickets, language = "English" }) {
  const getQuestions = (lang) => {
    if (lang === "Telugu") {
      return [
        "📍 మీరు మీ ప్రయాణాన్ని ఎక్కడి నుండి ప్రారంభిస్తున్నారు? (ఉదా., హైదరాబాద్, ముంబై, ఢిల్లీ)",
        "🌏 చాలా బాగుంది! మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు? (గమ్యం)",
        "🗓️ మీరు ఏ సీజన్ లేదా నెలలో సందర్శించాలనుకుంటున్నారు? (ఉదా., వేసవి, జూలై)",
        "⏳ ఈ పర్యటన కోసం మీరు ఎన్ని రోజులు ప్లాన్ చేస్తున్నారు?",
        "💰 ఈ ప్రయాణానికి మీ మొత్తం అంచనా బడ్జెట్ ఎంత?",
        "👥 చివరగా, మీతో ఎంతమంది సభ్యులు ప్రయాణిస్తున్నారు?",
      ];
    } else if (lang === "Hindi") {
      return [
        "📍 आप अपनी यात्रा कहाँ से शुरू कर रहे हैं? (उदा., हैदराबाद, मुंबई, दिल्ली)",
        "🌏 बहुत बढ़िया! आप कहाँ की यात्रा करना चाहेंगे? (मंज़िल)",
        "🗓️ आप किस मौसम या महीने में जाने की योजना बना रहे हैं? (उदा., गर्मी, जुलाई)",
        "⏳ आप इस यात्रा के लिए कितने दिनों की योजना बना रहे हैं?",
        "💰 यात्रा के लिए आपका कुल अनुमानित बजट क्या है?",
        "👥 अंत में, आपके साथ कितने सदस्य यात्रा कर रहे हैं?",
      ];
    }
    return [
      "📍 Where are you starting your journey from? (e.g., Hyderabad, Mumbai, Delhi)",
      "🌏 Great! Where would you like to travel? (Destination)",
      "🗓️ What season or month are you planning to visit? (e.g., Summer, Winter, July)",
      "⏳ How many days are you planning for this trip?",
      "💰 What is your total estimated budget for the trip?",
      "👥 Finally, how many members are travelling with you?",
    ];
  };

  const getGreeting = (lang) => {
    if (lang === "Telugu") return "👋 హాయ్! నేను మీ AI టూరిస్ట్ అసిస్టెంట్‌ని.\n\n" + getQuestions("Telugu")[0];
    if (lang === "Hindi") return "👋 नमस्ते! मैं आपका AI यात्रा सहायक हूँ।\n\n" + getQuestions("Hindi")[0];
    return "👋 Hi! I am your AI Travel Assistant.\n\n" + getQuestions("English")[0];
  };

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("travelChatMessages");
    return saved ? JSON.parse(saved) : [
      {
        sender: "bot",
        text: getGreeting(language),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionMedia, setSectionMedia] = useState({ mapUrl: null });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedSeasonItems, setSelectedSeasonItems] = useState([]);
  const [speechStatus, setSpeechStatus] = useState("stopped"); // "playing", "paused", "stopped"
  const messagesEndRef = useRef(null);

  // Form collection state
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("travelChatStep");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [travelData, setTravelData] = useState(() => {
    const saved = localStorage.getItem("travelChatData");
    return saved ? JSON.parse(saved) : {
      startingPoint: "",
      destination: "",
      season: "",
      days: "",
      budget: "",
      members: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("travelChatMessages", JSON.stringify(messages));
    localStorage.setItem("travelChatStep", step.toString());
    localStorage.setItem("travelChatData", JSON.stringify(travelData));
  }, [messages, step, travelData]);

  const uiText = {
    English: { title: "AI Travel Assistant", clear: "Clear History", close: "✖ Close", planAnother: "Plan Another Trip 🔄", bookTickets: "🎫 Book Tickets Now", edit: "✏️ Edit Details", sendPlaceholder: "Type your message...", askFollowup: "💬 Ask a follow-up question about your trip or tourist places", speakQuestion: "Speak your question..." },
    Telugu: { title: "AI ప్రయాణ సహాయకుడు", clear: "చరిత్రను క్లియర్ చేయండి", close: "✖ మూసివేయి", planAnother: "మరో ట్రిప్ ప్లాన్ చేయండి 🔄", bookTickets: "🎫 టిక్కెట్లను బుక్ చేయండి", edit: "✏️ వివరాలను సవరించండి", sendPlaceholder: "మీ సందేశాన్ని టైప్ చేయండి...", askFollowup: "💬 మీ ట్రిప్ లేదా పర్యాటక ప్రదేశాల గురించి ప్రశ్న అడగండి", speakQuestion: "మీ ప్రశ్న అడగండి..." },
    Hindi: { title: "AI यात्रा सहायक", clear: "इतिहास मिटाएं", close: "✖ बंद करें", planAnother: "एक और यात्रा की योजना बनाएं 🔄", bookTickets: "🎫 टिकट बुक करें", edit: "✏️ विवरण संपादित करें", sendPlaceholder: "अपना संदेश टाइप करें...", askFollowup: "💬 अपनी यात्रा या पर्यटन स्थलों के बारे में एक प्रश्न पूछें", speakQuestion: "अपना प्रश्न बोलें..." }
  };
  const t = uiText[language] || uiText["English"];

  const questions = getQuestions(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // ✅ Utility: Clean search terms for Wikipedia
  const cleanSearchQuery = (text) => {
    if (!text) return "";
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
      .replace(/(\*\*|__)/g, '') // Strip markdown bold symbols
      .replace(/[:]/g, '') // Strip colons
      .trim();
  };

  // ✅ Extract Map for Selected Section (Images Removed)
  useEffect(() => {
    if (!selectedSection) {
      setSectionMedia({ mapUrl: null, embedUrl: null });
      return;
    }

    const { title, content } = selectedSection;
    
    // Extract Google Maps links
    const mapRegex = /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=([^)\s\n]*)/;
    const mapMatch = content.match(mapRegex);
    const mapUrl = mapMatch ? mapMatch[0] : null;
    const queryParam = mapMatch ? mapMatch[1] : null;

    // Use the query parameter from the URL if available, otherwise use the section title
    const embedQuery = queryParam ? decodeURIComponent(queryParam.replace(/\+/g, " ")) : title;
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    setSectionMedia({ mapUrl, embedUrl });
  }, [selectedSection]);

  // ✅ New: Handle sub-item click within a section (e.g. clicking a specific attraction)
  const handleSubItemMedia = async (subTitle, fullText) => {
    // Clean the subtitle (remove markdown symbols)
    const cleanSubTitle = cleanSearchQuery(subTitle);
    if (!cleanSubTitle) return;

    // 1. Try to find a specific map link just for this sub-item
    const parts = fullText.split(subTitle);
    const contentAfter = parts.length > 1 ? parts[1].split(/^#+/m)[0] : "";
    
    const mapRegex = /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^\)\s\n]*/;
    const subMapMatch = contentAfter.match(mapRegex);
    const subMapUrl = subMapMatch ? subMapMatch[0] : null;

    // Always update the map URL if found
    if (subMapUrl) {
      const subQueryMatch = subMapUrl.match(/query=([^&\s\n]*)/);
      const subQuery = subQueryMatch ? decodeURIComponent(subQueryMatch[1].replace(/\+/g, " ")) : cleanSubTitle;
      const subEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(subQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      setSectionMedia(prev => ({ ...prev, mapUrl: subMapUrl, embedUrl: subEmbedUrl }));
    }
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Validate input via backend before advancing
      const valRes = await fetch("http://localhost:5001/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: userInput,
          question: questions[step],
          language: language,
        }),
      });
      const valData = await valRes.json();
      const validation = valData.result;

      if (validation.includes("GREETING")) {
        // ✅ Respond to greeting warmly, do NOT advance step
        setLoading(false);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "👋 Hello! I am your AI Travel Assistant! 🌍✈️\n\nI'm here to help you plan an amazing trip. Let's get started!\n\n" + questions[step],
            },
          ]);
        }, 400);
        return;
      }

      if (validation.includes("UNRELATED")) {
        // ✅ Reject non-travel input, do NOT advance step
        setLoading(false);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "🧳 I am your travel assistant so ask me about only related questions like for example greetings like hi, hello. (For example: 'explain python' is NOT a travel question)\n\n" + questions[step],
            },
          ]);
        }, 400);
        return;
      }
    } catch (error) {
      console.error("Validation error, proceeding anyway:", error);
    }

    setLoading(false);

    // ✅ VALID input — advance the step
    const newTravelData = { ...travelData };

    if (step === 0) newTravelData.startingPoint = userInput;
    else if (step === 1) newTravelData.destination = userInput;
    else if (step === 2) newTravelData.season = userInput;
    else if (step === 3) newTravelData.days = userInput;
    else if (step === 4) newTravelData.budget = userInput;
    else if (step === 5) newTravelData.members = userInput;

    setTravelData(newTravelData);

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: questions[nextStep] },
        ]);
      }, 600);
    } else {
      // All data collected, fetch AI response
      setTimeout(() => {
        fetchAIResponse(newTravelData);
      }, 600);
    }
  };

  const handleFollowUp = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage.text + ` (Please reply entirely in ${language} language)`, 
          context: travelData 
        }),
      });
      const result = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: result.reply, isMarkdown: true }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Unable to reach the server right now. Please make sure the backend server is running (`npm start` in the backend folder) and try again." }]);
    }
    setLoading(false);
  };

  const fetchAIResponse = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data: { 
            ...data, 
            language_instruction: `IMPORTANT: You MUST write your entire response, including the itinerary, exclusively in the ${language} language.`
          } 
        }),
      });

      const result = await res.json();
      const botMsg = { sender: "bot", text: result.reply, isMarkdown: true };
      setMessages((prev) => [...prev, botMsg]);

      // ✅ Save completed trip to Dashboard (separate from live chat)
      const session = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        startingPoint: data.startingPoint,
        destination: data.destination,
        season: data.season,
        days: data.days,
        budget: data.budget,
        members: data.members,
        reply: result.reply,
      };
      const existing = JSON.parse(localStorage.getItem("dashboardSessions") || "[]");
      localStorage.setItem("dashboardSessions", JSON.stringify([session, ...existing]));

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Oops! Something went wrong while connecting to the server. Please try again." },
      ]);
    }
    setLoading(false);
  };

  // ✅ Voice Assistant: Speech to Text (STT)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Your browser does not support voice recognition. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error("Speech Error:", e);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // ✅ Voice Assistant: Text to Speech (TTS)
  const speakText = (text) => {
    if (speechStatus === "playing") {
      window.speechSynthesis.pause();
      setSpeechStatus("paused");
      return;
    }
    if (speechStatus === "paused") {
      window.speechSynthesis.resume();
      setSpeechStatus("playing");
      return;
    }

    window.speechSynthesis.cancel(); 
    const cleanText = text
      .replace(/[#*`~\[\]()]/g, "") 
      .replace(/!\[.*?\]\(.*?\)/g, "") 
      .replace(/\[(.*?)\]\(.*?\)/g, "$1"); 

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.1;
    
    utterance.onstart = () => setSpeechStatus("playing");
    utterance.onend = () => setSpeechStatus("stopped");
    utterance.onerror = () => setSpeechStatus("stopped");
    
    window.speechSynthesis.speak(utterance);
  };

  const parseMarkdownToSections = (text) => {
    // Only split by Level 2 headings (##) to keep sections cohesive
    const sectionRegex = /^##\s+(.*?)$/gm;
    const sections = [];
    const matches = [...text.matchAll(sectionRegex)];
    
    if (matches.length === 0) return null;

    matches.forEach((match, i) => {
      const nextMatch = matches[i + 1];
      const start = match.index;
      const end = nextMatch ? nextMatch.index : text.length;
      
      const title = match[1].trim();
      const content = text.substring(start + match[0].length, end).trim();
      sections.push({ title, content });
    });

    return sections;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span>✨</span>
          <h2>{t.title}</h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              localStorage.removeItem("travelChatMessages");
              localStorage.removeItem("travelChatStep");
              localStorage.removeItem("travelChatData");
              setMessages([{ sender: "bot", text: getGreeting(language) }]);
              setStep(0);
              setTravelData({ startingPoint: "", destination: "", season: "", days: "", budget: "", members: "" });
            }}
            style={{
              background: "transparent",
              color: "#fca5a5",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              textDecoration: "underline"
            }}
          >
            {t.clear}
          </button>
          <button
            onClick={() => {
              setEditFormData({ ...travelData });
              setIsEditingDetails(true);
            }}
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              textDecoration: "underline"
            }}
            title={t.edit}
          >
            {t.edit}
          </button>
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            {t.close}
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-header">
              {msg.sender === "bot" && (
                <button 
                  className={`speak-btn ${speechStatus === "playing" ? "active" : ""}`} 
                  onClick={() => speakText(msg.text)} 
                  title={speechStatus === "playing" ? "Pause" : speechStatus === "paused" ? "Resume" : "Listen"}
                >
                  {speechStatus === "playing" ? "⏸️" : speechStatus === "paused" ? "▶️" : "🔊"}
                </button>
              )}
            </div>
            {msg.isMarkdown ? (
              (() => {
                const sections = parseMarkdownToSections(msg.text);
                // If we have sections, split the first (Welcome) from the rest (Cards)
                if (sections && sections.length > 1) {
                  const [welcome, ...cards] = sections;
                  return (
                    <div className="travel-plan-message">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {`### ${welcome.title}\n\n${welcome.content}`}
                      </ReactMarkdown>
                      
                      <div className="section-cards-grid">
                        {cards.map((section, sIndex) => (
                          <div 
                            key={sIndex} 
                            className="section-card"
                            onClick={() => setSelectedSection({ ...section, index: sIndex })}
                          >
                            <div className="section-card-icon">
                              {section.title.includes("Food") ? "🍽️" : 
                               section.title.includes("Places") ? "🗺️" :
                               section.title.includes("Reach") ? "✈️" :
                               section.title.includes("Weather") ? "🌦️" :
                               section.title.includes("Hotel") ? "🏨" : "✨"}
                            </div>
                            <h3>{section.title}</h3>
                            <span className="view-details-tag">View Details →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                );
              })()
            ) : (
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {step < questions.length && (
        <div>
          {/* Season & Month checkbox cards — shown only on step 2 */}
          {step === 2 && (
            <div style={{ padding: "0.75rem 1.5rem 0.5rem", borderTop: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.4)" }}>
              {/* Seasons */}
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.6rem", fontWeight: "600", letterSpacing: "0.05em" }}>
                🌤️ SEASONS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginBottom: "1rem" }}>
                {[
                  { emoji: "☀️", label: "Summer", value: "Summer", color: "rgba(251,191,36,0.18)", border: "rgba(251,191,36,0.5)", check: "#fbbf24" },
                  { emoji: "🌧️", label: "Monsoon", value: "Monsoon", color: "rgba(96,165,250,0.18)", border: "rgba(96,165,250,0.5)", check: "#60a5fa" },
                  { emoji: "❄️", label: "Winter", value: "Winter", color: "rgba(147,197,253,0.18)", border: "rgba(147,197,253,0.6)", check: "#93c5fd" },
                  { emoji: "🌸", label: "Spring", value: "Spring", color: "rgba(244,114,182,0.18)", border: "rgba(244,114,182,0.55)", check: "#f472b6" },
                  { emoji: "🍂", label: "Autumn", value: "Autumn", color: "rgba(251,146,60,0.18)", border: "rgba(251,146,60,0.5)", check: "#fb923c" },
                ].map((s) => {
                  const isSelected = selectedSeasonItems.includes(s.value);
                  return (
                    <div
                      key={s.value}
                      onClick={() => {
                        setSelectedSeasonItems(prev => 
                          prev.includes(s.value) ? prev.filter(i => i !== s.value) : [...prev, s.value]
                        );
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.9rem 0.5rem 0.6rem",
                        borderRadius: "10px",
                        border: `2px solid ${isSelected ? s.check : s.border}`,
                        background: isSelected ? s.color.replace("0.18", "0.35") : s.color,
                        cursor: "pointer",
                        transition: "all 0.18s",
                        boxShadow: isSelected ? `0 0 0 2px ${s.check}55` : "none",
                        userSelect: "none"
                      }}
                    >
                      {/* Custom checkbox square */}
                      <span style={{
                        width: "16px", height: "16px",
                        borderRadius: "4px",
                        border: `2px solid ${s.check}`,
                        background: isSelected ? s.check : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", color: "#0f172a", fontWeight: "bold",
                        flexShrink: 0, transition: "all 0.15s"
                      }}>
                        {isSelected ? "✓" : ""}
                      </span>
                      <span style={{ fontSize: "1.1rem" }}>{s.emoji}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: isSelected ? "#fff" : "#cbd5e1" }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Months */}
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.6rem", fontWeight: "600", letterSpacing: "0.05em" }}>
                📅 MONTHS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.45rem", marginBottom: "0.5rem" }}>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => {
                  const isSelected = selectedSeasonItems.includes(m);
                  return (
                    <div
                      key={m}
                      onClick={() => {
                        setSelectedSeasonItems(prev => 
                          prev.includes(m) ? prev.filter(i => i !== m) : [...prev, m]
                        );
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.4rem 0.5rem",
                        borderRadius: "8px",
                        border: `2px solid ${isSelected ? "#a78bfa" : "rgba(168,85,247,0.3)"}`,
                        background: isSelected ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.08)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow: isSelected ? "0 0 0 2px rgba(168,85,247,0.4)" : "none",
                        userSelect: "none"
                      }}
                    >
                      {/* Checkbox square */}
                      <span style={{
                        width: "14px", height: "14px",
                        borderRadius: "3px",
                        border: "2px solid #a78bfa",
                        background: isSelected ? "#a78bfa" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", color: "#0f172a", fontWeight: "bold",
                        flexShrink: 0, transition: "all 0.15s"
                      }}>
                        {isSelected ? "✓" : ""}
                      </span>
                      <span style={{ fontSize: "0.78rem", fontWeight: isSelected ? "700" : "500", color: isSelected ? "#e9d5ff" : "#94a3b8" }}>{m}</span>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Multi-selection button */}
              {selectedSeasonItems.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  <button
                    onClick={() => {
                      const combined = selectedSeasonItems.join(", ");
                      const userMessage = { sender: "user", text: combined };
                      setMessages((prev) => [...prev, userMessage]);
                      setInput("");
                      setSelectedSeasonItems([]); // Clear local selection
                      const newTravelData = { ...travelData, season: combined };
                      setTravelData(newTravelData);
                      const nextStep = step + 1;
                      setStep(nextStep);
                      if (nextStep < questions.length) {
                        setTimeout(() => setMessages((prev) => [...prev, { sender: "bot", text: questions[nextStep] }]), 600);
                      } else {
                        setTimeout(() => fetchAIResponse(newTravelData), 600);
                      }
                    }}
                    style={{
                      background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                      color: "white",
                      border: "none",
                      padding: "0.6rem 1.5rem",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      boxShadow: "0 4px 12px rgba(168,85,247,0.3)"
                    }}
                  >
                    Confirm Selection ({selectedSeasonItems.length}) →
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="chat-input-container">
            <button 
              className={`voice-btn ${isListening ? "listening" : ""}`} 
              onClick={startListening}
              title={isListening ? "Listening..." : "Click to speak"}
            >
              {isListening ? "🛑" : "🎙️"}
            </button>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={step === 2 ? (isListening ? "Listening..." : "Or type a month/season...") : (isListening ? "Listening..." : t.sendPlaceholder)}
              disabled={loading}
              autoFocus
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      {step >= questions.length && (
        <div style={{ borderTop: "1px solid var(--glass-border)", background: "rgba(30,41,59,0.3)" }}>
          <div style={{ padding: "0.5rem 2rem 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {t.askFollowup}
          </div>
          <div className="chat-input-container">
            <button 
              className={`voice-btn ${isListening ? "listening" : ""}`} 
              onClick={startListening}
            >
              {isListening ? "🛑" : "🎙️"}
            </button>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
              placeholder={isListening ? "Listening..." : t.speakQuestion}
              disabled={loading}
              autoFocus
            />
            <button
              className="send-btn"
              onClick={handleFollowUp}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
          <div style={{ padding: "0 2rem 1rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              className="start-btn"
              style={{ padding: "0.6rem 1.75rem", fontSize: "0.95rem" }}
              onClick={() => {
                setStep(0);
                setTravelData({ startingPoint: "", destination: "", season: "", days: "", budget: "", members: "" });
                setMessages((prev) => [...prev, { sender: "bot", text: getGreeting(language) }]);
              }}
            >
              {t.planAnother}
            </button>
            <button
              className="start-btn"
              style={{ padding: "0.6rem 1.75rem", fontSize: "0.95rem", background: "rgba(255,255,255,0.1)", color: "white" }}
              onClick={() => {
                setEditFormData({ ...travelData });
                setIsEditingDetails(true);
              }}
            >
              {t.edit}
            </button>
            <button
              className="book-tickets-btn"
              onClick={() => onBookTickets(travelData)}
            >
              {t.bookTickets}
            </button>
          </div>
        </div>
      )}
      {/* Section Detail Overlay */}
      {selectedSection && (
        <div className="detail-overlay" onClick={() => setSelectedSection(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>{selectedSection.title}</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {sectionMedia.mapUrl && (
                  <a 
                    href={sectionMedia.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-btn"
                    style={{ 
                      background: "rgba(34, 197, 94, 0.4)", 
                      color: "#fff", 
                      padding: "0.5rem 1rem", 
                      borderRadius: "20px",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                      border: "none"
                    }}
                  >
                    📍 Maps
                  </a>
                )}
                <button 
                  className="speak-btn-detail" 
                  onClick={() => speakText(`${selectedSection.title}. ${selectedSection.content}`)}
                >
                  {speechStatus === "playing" ? "⏸️ Pause" : speechStatus === "paused" ? "▶️ Resume" : "🔊 Listen"}
                </button>
                <button className="close-detail-btn" onClick={() => setSelectedSection(null)}>✖</button>
              </div>
            </div>
            <div className="detail-modal-body" style={{ padding: "0" }}>
              {sectionMedia.embedUrl && selectedSection.index === 0 && (
                <div className="map-container" style={{ borderRadius: "0", margin: "0", border: "none", borderBottom: "1px solid var(--glass-border)" }}>
                  <iframe 
                    className="map-iframe"
                    title="Section Map"
                    src={sectionMedia.embedUrl}
                  ></iframe>
                </div>
              )}
              <div style={{ padding: "2rem" }}>
              <ReactMarkdown
                components={{
                  a: ({ node, children, ...props }) => {
                    const isMaps = props.href?.includes("google.com/maps");
                    return (
                      <a 
                        {...props} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: isMaps ? "inline-flex" : "inline",
                          alignItems: "center",
                          gap: "4px",
                          background: isMaps ? "rgba(34, 197, 94, 0.15)" : "transparent",
                          color: isMaps ? "#4ade80" : "#60a5fa",
                          padding: isMaps ? "2px 10px" : "0",
                          borderRadius: "12px",
                          textDecoration: isMaps ? "none" : "underline",
                          fontSize: isMaps ? "0.8rem" : "inherit",
                          fontWeight: isMaps ? "bold" : "normal",
                          margin: isMaps ? "0 4px" : "0",
                          transition: "0.2s"
                        }}
                        onMouseOver={(e) => { if(isMaps) e.currentTarget.style.background = "rgba(34, 197, 94, 0.25)"; }}
                        onMouseOut={(e) => { if(isMaps) e.currentTarget.style.background = "rgba(34, 197, 94, 0.15)"; }}
                      >
                        {isMaps && "📍"} {children}
                      </a>
                    );
                  },
                  li: ({ node, children, ...props }) => (
                    <li {...props} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>
                      {children}
                    </li>
                  )
                }}
              >
                {selectedSection.content}
              </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Overlay */}
      {isEditingDetails && (
        <div className="detail-overlay" onClick={() => setIsEditingDetails(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>✏️ Edit Trip Details</h2>
              <button className="close-detail-btn" onClick={() => setIsEditingDetails(false)}>✖</button>
            </div>
            <div className="detail-modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Starting Point 📍</label>
                  <input className="chat-input" style={{ width: "90%", borderRadius: "8px" }} value={editFormData.startingPoint || ""} onChange={(e) => setEditFormData({ ...editFormData, startingPoint: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Destination 🎯</label>
                  <input className="chat-input" style={{ width: "90%", borderRadius: "8px" }} value={editFormData.destination || ""} onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Season / Month 🗓️</label>
                  <select
                    className="chat-input"
                    style={{ width: "93%", borderRadius: "8px", cursor: "pointer" }}
                    value={editFormData.season || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, season: e.target.value })}
                  >
                    <option value="">-- Select Season or Month --</option>
                    <optgroup label="🌤️ Seasons">
                      <option value="Summer">☀️ Summer</option>
                      <option value="Monsoon">🌧️ Monsoon</option>
                      <option value="Winter">❄️ Winter</option>
                      <option value="Spring">🌸 Spring</option>
                      <option value="Autumn">🍂 Autumn</option>
                    </optgroup>
                    <optgroup label="📅 Months">
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Days ⏳</label>
                  <input className="chat-input" style={{ width: "90%", borderRadius: "8px" }} value={editFormData.days || ""} onChange={(e) => setEditFormData({ ...editFormData, days: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Budget 💰</label>
                  <input className="chat-input" style={{ width: "90%", borderRadius: "8px" }} value={editFormData.budget || ""} onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#a5f3fc" }}>Members 👥</label>
                  <input className="chat-input" style={{ width: "90%", borderRadius: "8px" }} value={editFormData.members || ""} onChange={(e) => setEditFormData({ ...editFormData, members: e.target.value })} />
                </div>
                <button 
                  className="send-btn" 
                  style={{ width: "100%", borderRadius: "12px", marginTop: "1rem" }}
                  onClick={() => {
                    setTravelData(editFormData);
                    setIsEditingDetails(false);
                    if (step >= questions.length) {
                      setMessages((prev) => [...prev, { sender: "user", text: "I have updated my trip details. Please generate a new itinerary for me." }]);
                      fetchAIResponse(editFormData);
                    }
                  }}
                >
                  Save & Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Chatbot;