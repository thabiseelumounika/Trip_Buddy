import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const hotelOptions = [
  {
    id: "hostel",
    label: "Backpacker Hostel",
    icon: "🎒",
    color: "#fb923c",
    basePrice: 500,
    rating: 3.8,
    desc: "Shared dorms & basic facilities"
  },
  {
    id: "budget",
    label: "Budget Stay",
    icon: "🛏️",
    color: "#4ade80",
    basePrice: 1200,
    rating: 4.2,
    desc: "Clean & essential amenities"
  },
  {
    id: "standard",
    label: "Standard Hotel",
    icon: "🏨",
    color: "#60a5fa",
    basePrice: 2500,
    rating: 4.5,
    desc: "Comfortable rooms with AC & Wifi"
  },
  {
    id: "premium",
    label: "Premium Resort",
    icon: "🌴",
    color: "#a78bfa",
    basePrice: 5000,
    rating: 4.8,
    desc: "Pool, Spa, and fine dining"
  },
  {
    id: "luxury",
    label: "Luxury 5-Star",
    icon: "⭐",
    color: "#fbbf24",
    basePrice: 12000,
    rating: 4.9,
    desc: "World-class luxury & services"
  }
];

function parseBudget(str) {
  if (!str) return Infinity;
  const numStr = str.replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (!numStr) return Infinity;
  let val = parseFloat(numStr[0]);
  if (str.toLowerCase().includes('k')) val *= 1000;
  if (str.toLowerCase().includes('lakh')) val *= 100000;
  return val;
}

function HotelBooking({ onBack, tripDetails, initialData, onComplete, onExplore, transportCost = 0, transportName = "N/A" }) {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [step, setStep] = useState(1); // 1 = select hotel, 2 = guest details, 3 = success
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Use the trip details or fallback to formData if provided
  const dest = initialData?.to || tripDetails?.destination || "";
  const members = initialData?.passengers || tripDetails?.members || "2";

  // Parse days from string like "3 days" to integer
  let parsedDays = 1;
  if (tripDetails && tripDetails.days) {
    const match = tripDetails.days.match(/(\d+)/);
    if (match) {
      parsedDays = parseInt(match[0], 10);
    }
  }
  // Default to at least 1 night
  const nights = Math.max(1, parsedDays - 1);

  const [formData, setFormData] = useState({
    city: dest,
    checkIn: initialData?.date || "",
    nights: nights,
    guests: members,
    rooms: Math.ceil(parseInt(members || 2) / 2),
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    paymentMethod: "UPI",
  });

  const [totalCost, setTotalCost] = useState(0);

  const selectedHotelData = hotelOptions.find(h => h.id === selectedHotel);

  useEffect(() => {
    if (selectedHotelData && formData.nights && formData.rooms) {
      const cost = selectedHotelData.basePrice * formData.nights * formData.rooms;
      setTotalCost(cost);
    }
  }, [selectedHotel, formData.nights, formData.rooms]);

  const handleHotelSelect = (id) => {
    setSelectedHotel(id);
    if (id === "skip") {
      setTotalCost(0);
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleDownloadBill = () => {
    const billContent = `
=========================================
          TOURIST AI - TRIP BILL         
=========================================
Customer Name: ${formData.name}
Phone: ${formData.phone}
Destination: ${formData.city}
Date: ${formData.checkIn}

--- TRANSPORT ---
Mode: ${transportName}
Type: ${initialData?.isRoundTrip ? "Round Trip" : "One Way"}
${initialData?.isRoundTrip ? `Return Date: ${initialData.returnDate}` : ""}
Cost: Rs. ${transportCost.toLocaleString()}

${selectedHotel !== "skip" ? `--- ACCOMMODATION ---
Hotel: ${selectedHotelData?.label} (${formData.nights} Nights, ${formData.rooms} Rooms)
Rating: ${selectedHotelData?.rating} Stars
Cost: Rs. ${totalCost.toLocaleString()}
` : `--- ACCOMMODATION ---
No hotel selected.
`}
=========================================
TOTAL PAID: Rs. ${(transportCost + totalCost).toLocaleString()}
Payment Method: ${formData.paymentMethod}
=========================================
Thank you for booking with Tourist AI!
Thank you for visiting my website.
`;
    const blob = new Blob([billContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Trip_Bill_${formData.name.replace(/\s+/g, '_')}.txt`;
    link.click();
  };

  const remainingBudget = parseBudget(tripDetails?.budget) - (transportCost + totalCost);

  const handleAskRemainingAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("http://localhost:5001/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `I have successfully booked my travel ${selectedHotel !== "skip" ? "and hotel " : ""}to ${formData.city}. My total combined expense so far is ₹${(transportCost + totalCost).toLocaleString()}. I have exactly ₹${remainingBudget.toLocaleString()} REMAINING in my budget. Please suggest local places to visit, cheap local transport, food to eat, and activities I can do STRICTLY within this remaining amount.${selectedHotel !== "skip" ? " DO NOT suggest hotels or flights/trains since I already booked them." : " DO NOT suggest flights/trains since I already booked them."}`,
          context: tripDetails
        }),
      });
      const result = await res.json();
      setAiSuggestion(result.reply);
    } catch (error) {
      console.error(error);
      setAiSuggestion("⚠️ Unable to reach the server right now to get suggestions. Please make sure the backend server is running.");
    }
    setLoadingAi(false);
  };

  if (step === 3) {
    return (
      <div className="booking-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="booking-success" style={{ padding: "2.5rem" }}>
          <div className="success-icon">🎉</div>
          <h2>Booking Successfully Completed!</h2>
          <div className="success-details" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", padding: "2rem", borderRadius: "16px", marginTop: "1.5rem" }}>
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "#a5f3fc" }}>Trip Summary</h3>
            <p>✅ <strong>Destination:</strong> {formData.city}</p>
            <p>✅ <strong>Date:</strong> {formData.checkIn || "To be decided"}</p>
            <p>✅ <strong>Guest:</strong> {formData.name} ({formData.phone})</p>

            <h4 style={{ color: "#a5f3fc", marginTop: "1.5rem" }}>Transport Details</h4>
            <p>🚍 {transportName} — ₹{transportCost.toLocaleString()}</p>

            {selectedHotel !== "skip" && (
              <>
                <h4 style={{ color: "#a5f3fc", marginTop: "1rem" }}>Hotel Details</h4>
                <p>🏨 {selectedHotelData?.label} ({formData.nights} Nights, {formData.rooms} Rooms) — ₹{totalCost.toLocaleString()}</p>
                <p>⭐ <strong>Rating:</strong> {selectedHotelData?.rating} Stars</p>
              </>
            )}

            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "2px dashed rgba(255,255,255,0.4)" }}>
              <p>💳 <strong>Payment Method:</strong> {formData.paymentMethod}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                <p style={{ fontSize: "1.4rem", color: "#4facfe", fontWeight: "bold", margin: 0 }}>💰 <strong>Total Billed:</strong> ₹{(transportCost + totalCost).toLocaleString()}</p>
                {remainingBudget > 0 && remainingBudget !== Infinity && (
                  <div style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid #4ade80", padding: "0.5rem 1rem", borderRadius: "8px", color: "#4ade80", fontWeight: "bold" }}>
                    Remaining Budget: ₹{remainingBudget.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="success-note" style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>
            Your trip has been booked successfully! Have a wonderful journey. <br />
            <strong>Thank you for visiting my website!</strong>
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
            <button className="booking-btn secondary" onClick={handleDownloadBill} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              📥 Download receipt
            </button>
            <button className="booking-btn secondary" onClick={onExplore} style={{ background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", border: "none", color: "white", boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)" }}>
              📸 Try AI Image Scanner
            </button>
            <button className="booking-btn primary" onClick={onComplete}>
              🏠 Complete & Return to Home
            </button>
          </div>

          {/* Remaining Budget AI Suggestions Section */}
          {remainingBudget > 0 && remainingBudget !== Infinity && (
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <h3 style={{ color: "#a78bfa", marginBottom: "1rem", textAlign: "center" }}>Wondering what to do with the remaining ₹{remainingBudget.toLocaleString()}?</h3>

              {!aiSuggestion && !loadingAi && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={handleAskRemainingAi}
                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", padding: "0.8rem 1.5rem", borderRadius: "25px", color: "white", border: "none", cursor: "pointer", fontSize: "1.05rem", fontWeight: "bold", transition: "0.3s" }}
                  >
                    ✨ Ask AI for local activities & food to fit your budget!
                  </button>
                </div>
              )}

              {loadingAi && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="typing-indicator" style={{ display: "inline-flex" }}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <p style={{ color: "#a5f3fc", marginTop: "1rem" }}>AI is analyzing local attractions and food within ₹{remainingBudget.toLocaleString()}...</p>
                </div>
              )}

              {aiSuggestion && (
                <div className="message bot" style={{ marginTop: "1.5rem", width: "100%", maxWidth: "100%" }}>
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: "#34d399", textDecoration: "none" }} />
                      ),
                      h1: ({ node, ...props }) => <h3 style={{ color: "#a78bfa", marginTop: "1rem", marginBottom: "0.5rem" }} {...props} />,
                      h2: ({ node, ...props }) => <h3 style={{ color: "#a78bfa", marginTop: "1rem", marginBottom: "0.5rem" }} {...props} />,
                      h3: ({ node, ...props }) => <h4 style={{ color: "#60a5fa", marginTop: "1rem", marginBottom: "0.5rem" }} {...props} />,
                      strong: ({ node, ...props }) => <strong style={{ color: "#60a5fa" }} {...props} />
                    }}
                  >
                    {aiSuggestion}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {/* Header */}
      <div className="booking-header">
        <button className="back-btn" onClick={onBack}>← Back to Ticket</button>
        <h2 className="booking-title">🏨 Book Your Hotel in {dest || "your destination"}</h2>
        <div className="booking-steps">
          <span className={`step-dot ${step >= 1 ? "active" : ""}`}>1</span>
          <span className="step-line" />
          <span className={`step-dot ${step >= 2 ? "active" : ""}`}>2</span>
        </div>
      </div>

      <div className="booking-body">
        {/* Step 1: Choose Hotel Type */}
        {step >= 1 && (
          <div className={`booking-section ${step > 1 ? "completed" : ""}`}>
            <h3 className="section-label">Step 1: Choose Accommodation Type</h3>
            <div className="transport-grid">
              {hotelOptions.map((h) => (
                <button
                  key={h.id}
                  className={`transport-card ${selectedHotel === h.id ? "selected" : ""}`}
                  style={{ "--card-color": h.color }}
                  onClick={() => handleHotelSelect(h.id)}
                >
                  <span className="transport-icon">{h.icon}</span>
                  <span className="transport-label">{h.label}</span>
                  <div style={{ display: "flex", gap: "2px", alignItems: "center", justifyContent: "center", margin: "4px 0", color: "#fbbf24", fontSize: "0.85rem" }}>
                    {"⭐".repeat(Math.round(h.rating))} <span style={{ color: "#e2e8f0", marginLeft: "4px", fontWeight: "bold" }}>{h.rating}</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "0.25rem", color: "#e2e8f0" }}>{h.desc}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.5rem" }}>From ₹{h.basePrice}/night</span>
                </button>
              ))}
              <button
                className={`transport-card ${selectedHotel === "skip" ? "selected" : ""}`}
                style={{ "--card-color": "#9ca3af" }}
                onClick={() => handleHotelSelect("skip")}
              >
                <span className="transport-icon">⏭️</span>
                <span className="transport-label">Skip Hotel Booking</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "0.25rem", color: "#e2e8f0" }}>I have my own accommodation</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.5rem" }}>₹0</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Guest Details & Payment */}
        {step >= 2 && selectedHotelData && (
          <div className="booking-section">
            <h3 className="section-label">Step 2: Stay Details & Payment</h3>
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Destination City 📍</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Check-In Date 📅</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Number of Nights 🌙</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.nights}
                    onChange={e => setFormData({ ...formData, nights: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Number of Rooms 🔑</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rooms}
                    onChange={e => setFormData({ ...formData, rooms: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Guest Name 👤</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number 📞</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="payment-section" style={{ marginTop: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#a5f3fc" }}>💳 Payment Details</h4>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label>Select Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{
                      background: "rgba(255, 255, 255, 0.07)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      padding: "0.85rem 1.2rem",
                      borderRadius: "12px",
                      fontFamily: "inherit",
                      fontSize: "1rem"
                    }}
                  >
                    <option style={{ background: "#2e1065" }} value="UPI">UPI / GPay / PhonePe</option>
                    <option style={{ background: "#2e1065" }} value="Credit Card">Credit Card</option>
                    <option style={{ background: "#2e1065" }} value="Debit Card">Debit Card</option>
                    <option style={{ background: "#2e1065" }} value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
                  <span>Total for {formData.nights} night(s), {formData.rooms} room(s):</span>
                  <span style={{ color: "#4facfe", fontSize: "1.5rem" }}>₹{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-summary-bar">
                <span>{selectedHotelData?.icon} {selectedHotelData?.label}</span>
              </div>

              {parseBudget(tripDetails?.budget) < (totalCost + transportCost) && (
                <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", padding: "1rem", borderRadius: "12px", marginTop: "1rem", textAlign: "center" }}>
                  <p style={{ color: "#fca5a5", margin: 0, fontWeight: "bold" }}>⚠️ Budget Exceeded!</p>
                  <p style={{ color: "#fecaca", margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
                    Your combined trip cost (₹{(totalCost + transportCost).toLocaleString()}) exceeds your estimated budget of ₹{parseBudget(tripDetails?.budget).toLocaleString()}.
                    Please increase your budget or select a more affordable hotel.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="booking-btn primary"
                disabled={parseBudget(tripDetails?.budget) < (totalCost + transportCost)}
                style={{ opacity: parseBudget(tripDetails?.budget) < (totalCost + transportCost) ? 0.5 : 1, cursor: parseBudget(tripDetails?.budget) < (totalCost + transportCost) ? "not-allowed" : "pointer", marginTop: "1rem" }}
              >
                🔒 Pay ₹{totalCost.toLocaleString()} & Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelBooking;
