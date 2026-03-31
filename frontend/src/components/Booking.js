import React, { useState, useEffect } from "react";
import HotelBooking from "./HotelBooking";
import ExplorePlaces from "./ExplorePlaces";
import ReviewFeedback from "./ReviewFeedback";

const transportOptions = [
  {
    id: "train",
    label: "Train",
    icon: "🚂",
    color: "#4facfe",
    basePrice: 500,
    subtypes: [
      { id: "rajdhani", label: "Rajdhani Express", icon: "⚡", desc: "Premium fast intercity train", mult: 2.5 },
      { id: "shatabdi", label: "Shatabdi Express", icon: "🌟", desc: "High-speed day train", mult: 2.0 },
      { id: "duronto", label: "Duronto Express", icon: "🚀", desc: "Non-stop long distance", mult: 2.2 },
      { id: "express", label: "Express Train", icon: "🚃", desc: "Standard express service", mult: 1.0 },
      { id: "local", label: "Local / Passenger", icon: "🚉", desc: "Budget local train", mult: 0.5 },
      { id: "sleeper", label: "Vande Bharat", icon: "💺", desc: "Modern semi-high speed train", mult: 3.0 },
    ],
  },
  {
    id: "bus",
    label: "Bus",
    icon: "🚌",
    color: "#a855f7",
    basePrice: 400,
    subtypes: [
      { id: "volvo", label: "Volvo AC Sleeper", icon: "🛋️", desc: "Luxury overnight sleeper", mult: 2.5 },
      { id: "ac_seater", label: "AC Seater", icon: "❄️", desc: "Air-conditioned seats", mult: 1.5 },
      { id: "non_ac_sleeper", label: "Non-AC Sleeper", icon: "🌙", desc: "Budget overnight travel", mult: 1.2 },
      { id: "non_ac_seater", label: "Non-AC Seater", icon: "🪑", desc: "Economy budget bus", mult: 0.8 },
      { id: "mini_bus", label: "Mini Bus", icon: "🚍", desc: "Shared mini-bus service", mult: 0.6 },
    ],
  },
  {
    id: "flight",
    label: "Aeroplane",
    icon: "✈️",
    color: "#34d399",
    basePrice: 3500,
    subtypes: [
      { id: "economy", label: "Economy Class", icon: "💺", desc: "Affordable standard seating", mult: 1.0 },
      { id: "premium_economy", label: "Premium Economy", icon: "⭐", desc: "Extra comfort and space", mult: 1.5 },
      { id: "business", label: "Business Class", icon: "💼", desc: "Premium service and seating", mult: 3.0 },
      { id: "first_class", label: "First Class", icon: "👑", desc: "Ultimate luxury experience", mult: 5.0 },
    ],
  },
  {
    id: "taxi",
    label: "Taxi / Cab",
    icon: "🚕",
    color: "#fbbf24",
    basePrice: 1000,
    subtypes: [
      { id: "sedan", label: "Sedan / Cab", icon: "🚗", desc: "Standard 4-seater cab", mult: 1.0 },
      { id: "suv", label: "SUV / Innova", icon: "🚙", desc: "Spacious 7-seater vehicle", mult: 1.5 },
      { id: "auto", label: "Auto Rickshaw", icon: "🛺", desc: "Budget 3-wheeled auto", mult: 0.4 },
      { id: "mini", label: "Mini Cab (Hatchback)", icon: "🚘", desc: "Economy hatchback cab", mult: 0.8 },
      { id: "luxury", label: "Luxury Car", icon: "🏎️", desc: "Premium car service", mult: 3.0 },
    ],
  },
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

function parseDays(daysStr) {
  if (!daysStr) return 0;
  const match = daysStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function calculateReturnDate(startDate, daysStr) {
  if (!startDate || !daysStr) return "";
  const days = parseDays(daysStr);
  if (days <= 0) return startDate;

  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function Booking({ onBack, tripDetails }) {
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [step, setStep] = useState(1); // 1=choose type, 2=choose subtype, 3=details & payment, 4=success
  const [formData, setFormData] = useState({
    from: tripDetails?.startingPoint || "",
    to: tripDetails?.destination || "",
    date: "",
    time: "10:00",
    amPm: "AM",
    passengers: tripDetails?.members || "1",
    name: "",
    phone: "",
    paymentMethod: "UPI",
    isRoundTrip: false,
    returnDate: "",
    returnTime: "10:00",
    returnAmPm: "PM",
  });
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState("");
  const [showHotelBooking, setShowHotelBooking] = useState(false);
  const [showExplorePlaces, setShowExplorePlaces] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showTripReview, setShowTripReview] = useState(false);

  const selectedTransportData = transportOptions.find(t => t.id === selectedTransport);
  const selectedSubtypeData = selectedTransportData?.subtypes.find(s => s.id === selectedSubtype);

  useEffect(() => {
    if (selectedTransportData && selectedSubtypeData && formData.passengers) {
      const pCount = parseInt(formData.passengers, 10) || 1;
      const oneWayCost = selectedTransportData.basePrice * selectedSubtypeData.mult * pCount;
      const finalCost = formData.isRoundTrip ? oneWayCost * 2 : oneWayCost;
      setTotalCost(Math.round(finalCost));
    }
  }, [selectedTransport, selectedSubtype, formData.passengers, formData.isRoundTrip]);

  const handleTransportSelect = (id) => {
    setSelectedTransport(id);
    setSelectedSubtype(null);
    setStep(2);
  };

  const handleSubtypeSelect = (id) => {
    setSelectedSubtype(id);
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate phone number (at least 10 digits)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      setError("Please enter a valid phone number with at least 10 digits.");
      return;
    }
    setError("");
    
    // ✅ Save successful booking to Dashboard
    try {
      const newBooking = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        travelDate: `${formData.date} ${formData.time} ${formData.amPm}`,
        returnDate: formData.isRoundTrip ? `${formData.returnDate} ${formData.returnTime} ${formData.returnAmPm}` : "",
        from: formData.from,
        to: formData.to,
        passengers: formData.passengers,
        name: formData.name,
        phone: formData.phone,
        transport: selectedTransportData?.label,
        subtype: selectedSubtypeData?.label,
        totalCost: totalCost,
        paymentMethod: formData.paymentMethod,
        isRoundTrip: formData.isRoundTrip
      };
      
      const existing = JSON.parse(localStorage.getItem("dashboardBookings") || "[]");
      localStorage.setItem("dashboardBookings", JSON.stringify([newBooking, ...existing]));
      console.log("Booking saved to local history:", newBooking);
    } catch (e) {
      console.error("Failed to save booking history:", e);
    }

    setStep(4);
  };

  const userBudget = parseBudget(tripDetails?.budget);
  const isOverBudget = totalCost > userBudget;

  if (showThankYou) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        overflowY: "auto"
      }}>
        {/* Hero Section */}
        <div style={{ flex: "none", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          {/* Animated Icon */}
          <div style={{ fontSize: "5rem", marginBottom: "1.5rem", filter: "drop-shadow(0 0 30px rgba(167, 243, 252, 0.5))" }}>🎉</div>

          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "white", margin: "0 0 0.5rem 0", letterSpacing: "-1px" }}>
            Thank You!
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#a5f3fc", marginBottom: "3rem", fontStyle: "italic" }}>
            Your trip to <strong style={{ color: "white" }}>{formData.city || tripDetails?.destination}</strong> is all set. Have a safe and wonderful journey! ✈️
          </p>

          {/* Contact Card */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "20px",
            padding: "2.5rem 3rem",
            maxWidth: "480px",
            width: "100%",
            marginBottom: "3rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📬</div>
            <p style={{ color: "#9ca3af", fontSize: "1rem", margin: "0 0 0.75rem 0" }}>For any queries, feel free to contact me:</p>
            <a href="mailto:touristai.navigator@gmail.com" style={{
              display: "inline-block",
              color: "#4ade80",
              fontSize: "1.1rem",
              textDecoration: "none",
              fontWeight: "bold",
              background: "rgba(74, 222, 128, 0.08)",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "10px",
              padding: "0.6rem 1.2rem",
            }}>
              touristai.navigator@gmail.com
            </a>
          </div>

          <button
            onClick={() => { setShowThankYou(false); setShowTripReview(true); }}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              border: "none",
              padding: "1rem 3.5rem",
              borderRadius: "50px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.5)",
              letterSpacing: "0.5px",
              marginBottom: "1rem"
            }}
          >
            Next: Share Your Experience 💬
          </button>

          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "0.8rem 2.5rem",
              borderRadius: "50px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Skip & Return to Homepage
          </button>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          padding: "1.5rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          color: "#6b7280",
          fontSize: "0.9rem"
        }}>
          <p style={{ margin: "0 0 0.3rem 0" }}>© {new Date().getFullYear()} Tourist AI Planner · All rights reserved.</p>
          <p style={{ margin: 0 }}>Built with ❤️ by <strong style={{ color: "#a78bfa" }}>Mounika</strong></p>
        </footer>
      </div>
    );
  }

  if (showTripReview) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "4rem 2rem",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        overflowY: "auto"
      }}>
        <ReviewFeedback
          destination={formData.to || tripDetails?.destination}
          userName={formData.name || ""}
        />

        <button
          onClick={onBack}
          style={{
            marginTop: "2rem",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "1rem 3rem",
            borderRadius: "50px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🏠 Finish & Return Home
        </button>
      </div>
    );
  }

  if (showExplorePlaces) {
    return <ExplorePlaces onBack={() => setShowThankYou(true)} destination={formData.to || tripDetails?.destination || "India"} />;
  }

  if (showHotelBooking) {
    return (
      <HotelBooking
        onBack={() => setShowHotelBooking(false)}
        tripDetails={tripDetails}
        initialData={formData}
        onComplete={() => setShowThankYou(true)}
        onExplore={() => setShowExplorePlaces(true)}
        transportCost={totalCost}
        transportName={`${selectedTransportData?.label} (${selectedSubtypeData?.label})`}
      />
    );
  }

  if (step === 4) {
    return (
      <div className="booking-container">
        <div className="booking-success">
          <div className="success-icon">🎉</div>
          <h2>Booking Confirmed!</h2>
          <div className="success-details">
            <p>✅ <strong>Transport:</strong> {selectedTransportData?.label} — {selectedSubtypeData?.label}</p>
            <p>✅ <strong>From:</strong> {formData.from}</p>
            <p>✅ <strong>To:</strong> {formData.to}</p>
            <p>✅ <strong>Date:</strong> {formData.date} at {formData.time} {formData.amPm}</p>
            {formData.isRoundTrip && <p>🔄 <strong>Return Date:</strong> {formData.returnDate} at {formData.returnTime} {formData.returnAmPm}</p>}
            <p>✅ <strong>Passengers:</strong> {formData.passengers}</p>
            <p>✅ <strong>Name:</strong> {formData.name}</p>
            <p>✅ <strong>Phone:</strong> {formData.phone}</p>
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed rgba(255,255,255,0.2)" }}>
              <p>💳 <strong>Payment Method:</strong> {formData.paymentMethod}</p>
              <p style={{ fontSize: "1.2rem", color: "#a5f3fc" }}>💰 <strong>Total Paid:</strong> ₹{totalCost.toLocaleString()}</p>
            </div>
          </div>
          <p className="success-note">Your booking request has been submitted. You will receive confirmation details shortly.</p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
            <button className="booking-btn primary" onClick={() => setShowHotelBooking(true)}>
              🏨 Add Hotel Booking
            </button>
            <button className="booking-btn secondary" onClick={() => setShowThankYou(true)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              🏁 Complete & Finish Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {/* Header */}
      <div className="booking-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="booking-title">🎫 Book Your Tickets</h2>
        <div className="booking-steps">
          <span className={`step-dot ${step >= 1 ? "active" : ""}`}>1</span>
          <span className="step-line" />
          <span className={`step-dot ${step >= 2 ? "active" : ""}`}>2</span>
          <span className="step-line" />
          <span className={`step-dot ${step >= 3 ? "active" : ""}`}>3</span>
        </div>
      </div>

      <div className="booking-body">
        {/* Trip Summary from Chatbot */}
        {tripDetails && (
          <div className="trip-summary-banner">
            <h3>✅ Trip details from your AI analysis</h3>
            <div className="trip-summary-grid">
              {tripDetails.startingPoint && <div className="trip-chip">📍 From: <strong>{tripDetails.startingPoint}</strong></div>}
              {tripDetails.destination && <div className="trip-chip">🎯 To: <strong>{tripDetails.destination}</strong></div>}
              {tripDetails.members && <div className="trip-chip">👥 Members: <strong>{tripDetails.members}</strong></div>}
              {tripDetails.days && <div className="trip-chip">🗓️ Days: <strong>{tripDetails.days}</strong></div>}
              {tripDetails.budget && <div className="trip-chip">💰 Budget: <strong>{tripDetails.budget}</strong></div>}
              {tripDetails.season && <div className="trip-chip">🌤️ Season: <strong>{tripDetails.season}</strong></div>}
            </div>
            <p className="trip-summary-note">👇 These details are pre-filled in your booking form below.</p>
          </div>
        )}

        {/* Step 1: Choose transport mode */}
        {step >= 1 && (
          <div className={`booking-section ${step > 1 ? "completed" : ""}`}>
            <h3 className="section-label">Step 1: Choose Transport Mode</h3>
            <div className="transport-grid">
              {transportOptions.map((t) => (
                <button
                  key={t.id}
                  className={`transport-card ${selectedTransport === t.id ? "selected" : ""}`}
                  style={{ "--card-color": t.color }}
                  onClick={() => handleTransportSelect(t.id)}
                >
                  <span className="transport-icon">{t.icon}</span>
                  <span className="transport-label">{t.label}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.5rem" }}>From ₹{t.basePrice}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose sub-type */}
        {step >= 2 && selectedTransportData && (
          <div className={`booking-section ${step > 2 ? "completed" : ""}`}>
            <h3 className="section-label">
              Step 2: Choose {selectedTransportData.label} Type
            </h3>
            <div className="subtype-grid">
              {selectedTransportData.subtypes.map((s) => (
                <button
                  key={s.id}
                  className={`subtype-card ${selectedSubtype === s.id ? "selected" : ""}`}
                  onClick={() => handleSubtypeSelect(s.id)}
                >
                  <span className="subtype-icon">{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="subtype-name">{s.label}</div>
                    <div className="subtype-desc">{s.desc}</div>
                  </div>
                  <div style={{ fontWeight: "bold", color: "#a5f3fc" }}>
                    ₹{Math.round(selectedTransportData.basePrice * s.mult)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Booking form & Payment */}
        {step >= 3 && (
          <div className="booking-section">
            <h3 className="section-label">Step 3: Enter Details & Payment</h3>

            {/* Round Trip Toggle */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>↔️</span>
                <span style={{ fontWeight: "600" }}>Round Trip (Add Return Ticket)</span>
              </div>
              <label className="switch" style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={formData.isRoundTrip}
                  onChange={e => {
                    const isRound = e.target.checked;
                    let newReturnDate = formData.returnDate;
                    if (isRound && formData.date && !formData.returnDate) {
                      newReturnDate = calculateReturnDate(formData.date, tripDetails?.days);
                    }
                    setFormData({ ...formData, isRoundTrip: isRound, returnDate: newReturnDate });
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: formData.isRoundTrip ? "#4facfe" : "#ccc",
                  transition: ".4s", borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px",
                    backgroundColor: "white", transition: ".4s", borderRadius: "50%",
                    transform: formData.isRoundTrip ? "translateX(26px)" : "translateX(0)"
                  }}></span>
                </span>
              </label>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>From 📍</label>
                  <input
                    type="text"
                    placeholder="Departure city"
                    value={formData.from}
                    onChange={e => setFormData({ ...formData, from: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>To 🎯</label>
                  <input
                    type="text"
                    placeholder="Destination city"
                    value={formData.to}
                    onChange={e => setFormData({ ...formData, to: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Travel Date 📅</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => {
                      const newDate = e.target.value;
                      let newReturnDate = formData.returnDate;
                      if (formData.isRoundTrip) {
                        newReturnDate = calculateReturnDate(newDate, tripDetails?.days);
                      }
                      setFormData({ ...formData, date: newDate, returnDate: newReturnDate });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Travel Time 🕒</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      required
                      style={{ flex: 2 }}
                    />
                    <select
                      value={formData.amPm}
                      onChange={e => setFormData({ ...formData, amPm: e.target.value })}
                      style={{ flex: 1, background: "rgba(255,255,255,0.07)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "0.5rem" }}
                    >
                      <option value="AM" style={{ background: "#2e1065" }}>AM</option>
                      <option value="PM" style={{ background: "#2e1065" }}>PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {formData.isRoundTrip && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Return Date 📅</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
                      required={formData.isRoundTrip}
                      min={formData.date}
                    />
                  </div>
                  <div className="form-group">
                    <label>Return Time 🕒</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={e => setFormData({ ...formData, returnTime: e.target.value })}
                        required={formData.isRoundTrip}
                        style={{ flex: 2 }}
                      />
                      <select
                        value={formData.returnAmPm}
                        onChange={e => setFormData({ ...formData, returnAmPm: e.target.value })}
                        style={{ flex: 1, background: "rgba(255,255,255,0.07)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "0.5rem" }}
                      >
                        <option value="AM" style={{ background: "#2e1065" }}>AM</option>
                        <option value="PM" style={{ background: "#2e1065" }}>PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Passengers 👥</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.passengers}
                    onChange={e => setFormData({ ...formData, passengers: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name 👤</label>
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
                    onChange={e => {
                      setFormData({ ...formData, phone: e.target.value });
                      setError("");
                    }}
                    required
                  />
                  {error && <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.25rem" }}>{error}</span>}
                </div>
              </div>

              {/* Payment Section */}
              <div className="payment-section" style={{ marginTop: "1rem", pading: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
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
                  <span>Total Amount for {formData.passengers || 0} pax:</span>
                  <span style={{ color: "#4facfe", fontSize: "1.5rem" }}>₹{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-summary-bar">
                <span>{selectedTransportData?.icon} {selectedTransportData?.label}</span>
                <span>→</span>
                <span>{selectedSubtypeData?.icon} {selectedSubtypeData?.label}</span>
              </div>

              {isOverBudget && (
                <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", padding: "1rem", borderRadius: "12px", marginTop: "1rem", textAlign: "center" }}>
                  <p style={{ color: "#fca5a5", margin: 0, fontWeight: "bold" }}>⚠️ Budget Exceeded!</p>
                  <p style={{ color: "#fecaca", margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
                    Your transport cost (₹{totalCost.toLocaleString()}) exceeds your estimated budget of ₹{userBudget.toLocaleString()}.
                    Please increase your budget or select a more affordable transport option.
                  </p>
                </div>
              )}

              <button type="submit" className="booking-btn primary" disabled={isOverBudget} style={{ opacity: isOverBudget ? 0.5 : 1, cursor: isOverBudget ? "not-allowed" : "pointer", marginTop: "1rem" }}>
                🔒 Pay ₹{totalCost.toLocaleString()} & Confirm
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
