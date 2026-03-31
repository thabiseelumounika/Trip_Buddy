import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './../index.css';

function Dashboard({ onBack, language }) {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("trips"); // "trips" or "bookings"
  const [expanded, setExpanded] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionMedia, setSectionMedia] = useState({ img: null, mapUrl: null, loading: false });
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem("dashboardSessions");
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    
    const savedBookings = localStorage.getItem("dashboardBookings");
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  const clearAllHistory = () => {
    const type = activeTab === "trips" ? "travel plans" : "ticket bookings";
    if (window.confirm(`Are you sure you want to delete ALL saved ${type}?`)) {
      if (activeTab === "trips") {
        localStorage.removeItem("dashboardSessions");
        setSessions([]);
      } else {
        localStorage.removeItem("dashboardBookings");
        setBookings([]);
      }
    }
  };

  const deleteItem = (id) => {
    if (activeTab === "trips") {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      localStorage.setItem("dashboardSessions", JSON.stringify(updated));
    } else {
      const updated = bookings.filter((b) => b.id !== id);
      setBookings(updated);
      localStorage.setItem("dashboardBookings", JSON.stringify(updated));
    }
    if (expanded === id) setExpanded(null);
  };

  // ✅ Utility: Clean search terms for Wikipedia
  const cleanSearchQuery = (text) => {
    if (!text) return "";
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
      .replace(/(\*\*|__)/g, '') // Strip markdown bold symbols
      .replace(/[:]/g, '') // Strip colons
      .trim();
  };

  const parseMarkdownToSections = (text) => {
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

  const parseSubItems = (content) => {
    if (!content) return [];
    const items = content.split(/^###\s+/m).slice(1);
    return items.map(item => {
      const lines = item.split("\n");
      const title = cleanSearchQuery(lines[0]);
      const rest = lines.slice(1).join("\n");
      const mapRegex = /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^\)\s\n]*/;
      const mapMatch = rest.match(mapRegex);
      const mapUrl = mapMatch ? mapMatch[0] : null;
      const desc = rest.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "").trim().split("\n")[0];
      return { title, description: desc, mapUrl, fullContent: item };
    });
  };

  const handleSubItemMedia = async (title, content, destination) => {
    setSectionMedia({ img: null, mapUrl: null, loading: true });
    
    // Extract map link
    const mapRegex = /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^\)\s\n]*/;
    const mapMatch = (content || "").match(mapRegex);
    const subMapUrl = mapMatch ? mapMatch[0] : null;

    try {
      const query = encodeURIComponent(`${destination || "India"} ${cleanSearchQuery(title)}`);
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=1000&origin=*`;
      const res = await fetch(wikiUrl);
      const data = await res.json();
      if (data.query && data.query.pages) {
        const page = Object.values(data.query.pages)[0];
        const wikiImg = page.thumbnail ? page.thumbnail.source : null;
        if (wikiImg) setEnlargedImage(wikiImg);
        setSectionMedia({ img: wikiImg, mapUrl: subMapUrl, loading: false });
      } else {
        setSectionMedia({ img: null, mapUrl: subMapUrl, loading: false });
      }
    } catch (e) {
      setSectionMedia({ img: null, mapUrl: subMapUrl, loading: false });
    }
  };

  const SubItemCard = ({ item, destination }) => {
    const [img, setImg] = useState(null);
    const [loadingImg, setLoadingImg] = useState(true);

    useEffect(() => {
      const fetchImg = async () => {
        try {
          const query = encodeURIComponent(`${destination || "India"} ${item.title}`);
          const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&origin=*`;
          const res = await fetch(wikiUrl);
          const data = await res.json();
          if (data.query && data.query.pages) {
            const page = Object.values(data.query.pages)[0];
            setImg(page.thumbnail ? page.thumbnail.source : null);
          }
        } catch (e) {} finally { setLoadingImg(false); }
      };
      fetchImg();
    }, [item.title, destination]);

    return (
      <div className="sub-item-card" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div 
          style={{ height: "100px", background: "rgba(0,0,0,0.2)", position: "relative", cursor: img ? "zoom-in" : "default" }}
          onClick={() => img && setEnlargedImage(img)}
        >
          {loadingImg ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>...</div> : 
           img ? <img src={img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : 
           <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>📍</div>}
        </div>
        <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#60a5fa" }}>{item.title}</h4>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
            {item.mapUrl && <a href={item.mapUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", background: "rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "0.3rem", borderRadius: "6px", fontSize: "0.7rem", textDecoration: "none", fontWeight: "bold" }}>📍 Maps</a>}
            <button onClick={(e) => { e.stopPropagation(); handleSubItemMedia(item.title, item.fullContent, destination); }} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "white", padding: "0.3rem", borderRadius: "6px", fontSize: "0.7rem", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>🖼️ View</button>
          </div>
        </div>
      </div>
    );
  };

  const translations = {
    English: { title: "Travel Dashboard", trips: "Planned Trips", bookings: "Confirmed Bookings", clear: "🗑️ Clear List", back: "🔙 Back", empty: "📭 No data found here yet." },
    Telugu: { title: "ప్రయాణ డ్యాష్‌బోర్డ్", trips: "ప్లాన్ చేసిన పర్యటనలు", bookings: "ధృవీకరించబడిన బుకింగ్‌లు", clear: "🗑️ క్లియర్ చేయండి", back: "🔙 వెనుకకు", empty: "📭 ఇంకా డేటా ఏమీ లేదు." },
    Hindi: { title: "यात्रा डैशबोर्ड", trips: "नियोजित यात्राएं", bookings: "पुष्टि की गई बुकिंग", clear: "🗑️ सूची मिटाएं", back: "🔙 पीछे", empty: "📭 अभी कोई डेटा नहीं मिला।" }
  };
  const t = translations[language] || translations["English"];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">📊 {t.title}</h2>
        <div className="dashboard-actions">
          {(activeTab === "trips" ? sessions : bookings).length > 0 && (
            <button className="clear-btn" onClick={clearAllHistory}>{t.clear}</button>
          )}
          <button className="back-btn" onClick={onBack}>{t.back}</button>
        </div>
      </div>

      <div className="dashboard-tabs" style={{ display: "flex", gap: "10px", padding: "0 3rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <button 
          onClick={() => { setActiveTab("trips"); setExpanded(null); }}
          className={`tab-btn ${activeTab === "trips" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.5rem", borderRadius: "50px", border: "none", cursor: "pointer", background: activeTab === "trips" ? "var(--accent-color)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", transition: "0.3s" }}
        >
          📂 {t.trips}
        </button>
        <button 
          onClick={() => { setActiveTab("bookings"); setExpanded(null); }}
          className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.5rem", borderRadius: "50px", border: "none", cursor: "pointer", background: activeTab === "bookings" ? "#10b981" : "rgba(255,255,255,0.05)", color: "white", fontWeight: "bold", transition: "0.3s" }}
        >
          🎫 {t.bookings}
        </button>
      </div>

      <div className="dashboard-content" style={{ padding: "2rem 3rem" }}>
        {activeTab === "trips" ? (
          <div className="history-list">
            {sessions.length === 0 && <div className="empty-history">📭 {t.empty}</div>}
            {sessions.map((session) => (
              <div key={session.id} className="session-card" style={{ marginBottom: "1rem" }}>
                <div className="session-card-header" onClick={() => setExpanded(expanded === session.id ? null : session.id)} style={{ padding: "1.25rem", cursor: "pointer" }}>
                  <div className="session-info">
                    <span className="session-route" style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#a5f3fc" }}>📍 {session.startingPoint} → 🌏 {session.destination}</span>
                    <span className="session-meta" style={{ opacity: 0.7 }}>{session.days} days · {session.season} · {session.members} members</span>
                    <span className="session-date" style={{ fontSize: "0.8rem", color: "#64748b" }}>🕒 {session.date}</span>
                  </div>
                  <div className="session-card-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button className="delete-session-btn" onClick={(e) => { e.stopPropagation(); deleteItem(session.id); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer" }}>🗑️</button>
                    <span className="expand-icon">{expanded === session.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded === session.id && (
                  <div className="session-reply" style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
                    {(() => {
                      const sections = parseMarkdownToSections(session.reply);
                      if (sections && sections.length > 1) {
                        const [welcome, ...cards] = sections;
                        return (
                          <div className="travel-plan-message">
                            <ReactMarkdown components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
                              {`### ${welcome.title}\n\n${welcome.content}`}
                            </ReactMarkdown>

                            <div className="section-cards-grid">
                              {cards.map((section, sIndex) => (
                                <div key={sIndex} className="section-card" onClick={() => setSelectedSection(section)}>
                                  <div className="section-card-icon">
                                    {section.title.includes("Food") ? "🍽️" : section.title.includes("Places") ? "🗺️" : section.title.includes("Reach") ? "✈️" : section.title.includes("Weather") ? "🌦️" : "✨"}
                                  </div>
                                  <h3>{section.title}</h3>
                                  <span className="view-details-tag">Explore AI View →</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return <ReactMarkdown components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{session.reply}</ReactMarkdown>;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bookings-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {bookings.length === 0 && <div className="empty-history">📭 {t.empty}</div>}
            {bookings.map((b) => (
              <div key={b.id} className="booking-card" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "1.5rem", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🎫 Ticket</span>
                  <button onClick={() => deleteItem(b.id)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}>✖</button>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#a5f3fc", marginBottom: "0.5rem" }}>{b.from} → {b.to}</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1rem" }}>
                   {b.travelDate} {b.isRoundTrip && ` · 🔄 Return: ${b.returnDate}`}
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", fontSize: "0.9rem" }}>
                   <p style={{ margin: "0 0 0.4rem 0" }}>👤 <strong>{b.name}</strong> ({b.passengers} pax)</p>
                   <p style={{ margin: "0 0 0.4rem 0" }}>🚀 <strong>{b.transport}</strong> · {b.subtype}</p>
                   <p style={{ margin: 0, color: "#10b981", fontWeight: "bold", fontSize: "1.1rem" }}>💰 Paid: ₹{b.totalCost?.toLocaleString()}</p>
                </div>
                <div style={{ marginTop: "1rem", fontSize: "0.75rem", opacity: 0.5 }}>🕒 Booked on: {b.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Detail Overlay (Synced from Chatbot) */}
      {selectedSection && (
        <div className="detail-overlay" onClick={() => setSelectedSection(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>{selectedSection.title}</h2>
              <button className="close-detail-btn" onClick={() => setSelectedSection(null)}>✖</button>
            </div>
            <div className="detail-modal-body">
              {(() => {
                const subItems = parseSubItems(selectedSection.content);
                if (subItems.length > 0) {
                  return (
                    <div style={{ marginBottom: "2rem" }}>
                      <h3 style={{ fontSize: "1.1rem", color: "#a5f3fc", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>✨ Quick Exploration</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
                        {subItems.map((item, idx) => <SubItemCard key={idx} item={item} destination={sessions.find(s => s.id === expanded)?.destination} />)}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <ReactMarkdown components={{ a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{selectedSection.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Image Lightbox (Synced from Chatbot) */}
      {enlargedImage && (
        <div className="lightbox-overlay" onClick={() => setEnlargedImage(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", cursor: "zoom-out" }}>
          <button onClick={() => setEnlargedImage(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "white", color: "black", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", zIndex: 3001, display: "flex", alignItems: "center", justifyContent: "center" }}>✖</button>
          <a href={enlargedImage} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(5px)", color: "white", padding: "0.8rem 1.5rem", borderRadius: "50px", textDecoration: "none", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.3)", zIndex: 3001 }}>🌐 Open in New Tab</a>
          <img src={enlargedImage} alt="Full Preview" style={{ maxWidth: "95%", maxHeight: "95%", borderRadius: "12px", objectFit: "contain", boxShadow: "0 0 50px rgba(0,0,0,0.5)" }} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
