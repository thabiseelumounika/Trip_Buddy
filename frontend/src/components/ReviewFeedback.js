import React, { useState, useEffect } from "react";

function ReviewFeedback({ destination, userName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState(userName || "");
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Keep name in sync with prop
  useEffect(() => {
    if (userName && !name) setName(userName);
  }, [userName, name]); // Added 'name' to dependency array to avoid stale closure if name is updated internally

  // Load existing reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const url = destination 
          ? `http://localhost:5001/reviews?destination=${encodeURIComponent(destination)}`
          : `http://localhost:5001/reviews`;
        const res = await fetch(url);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [destination]);

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim() || !name.trim()) {
      setError("Please fill in all fields (stars, name, and review).");
      return;
    }
    setSubmitting(true);
    setError("");
    console.log("Submitting review for:", destination);
    try {
      const res = await fetch("http://localhost:5001/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination || "Website Feedback",
          name: name.trim(),
          rating,
          review: reviewText.trim(),
        }),
      });
      
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      if (data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setSubmitted(true);
        setReviewText("");
        setRating(0);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Unable to save review. Please check if the server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, size = "1.6rem", interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`review-star ${(interactive ? (hoverRating || rating) : count) >= star ? "active" : ""}`}
        style={{ fontSize: size, cursor: interactive ? "pointer" : "default" }}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isGlobal = !destination;

  return (
    <div className="review-section" style={{ maxWidth: isGlobal ? "800px" : "560px" }}>
      <div className="review-section-header">
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{isGlobal ? "⭐" : "💬"}</div>
        <h2 className="review-section-title">
          {isGlobal ? "Website Feedback & Reviews" : "Share Your Experience"}
        </h2>
        <p className="review-section-subtitle">
          {isGlobal 
            ? "We'd love to hear your thoughts about our Tourist AI service!" 
            : `How was your trip to ${destination}? Your feedback helps fellow travelers!`}
        </p>
      </div>

      {!submitted ? (
        <div className="review-form-card">
          {/* Star Rating */}
          <div className="review-form-group">
            <label className="review-label">{isGlobal ? "Rate Our Service" : "Your Rating"}</label>
            <div className="review-stars-row">
              {renderStars(rating, "2rem", true)}
              <span className="review-rating-text">
                {rating === 0 && "Tap a star"}
                {rating === 1 && "Poor 😞"}
                {rating === 2 && "Fair 😐"}
                {rating === 3 && "Good 🙂"}
                {rating === 4 && "Great 😄"}
                {rating === 5 && "Amazing 🤩"}
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="review-form-group">
            <label className="review-label">Your Name</label>
            <input
              type="text"
              className="review-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Review Text */}
          <div className="review-form-group">
            <label className="review-label">{isGlobal ? "Your Feedback" : "Your Review"}</label>
            <textarea
              className="review-textarea"
              placeholder={isGlobal 
                ? "How can we improve? What did you like most about the app?"
                : "Tell us about your experience — what did you love? Any tips for other travelers?"}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: "rgba(239, 68, 68, 0.15)", 
              border: "1px solid #ef4444", 
              color: "#fca5a5", 
              padding: "0.8rem", 
              borderRadius: "10px", 
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="review-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "✨ Submit Review"}
          </button>
        </div>
      ) : (
        <div className="review-success-msg">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
          <h3>Thank You for Your Feedback!</h3>
          <p>Your review has been saved successfully.</p>
          <button
            className="review-write-another-btn"
            onClick={() => setSubmitted(false)}
          >
            ✍️ Write Another
          </button>
        </div>
      )}

      {/* Existing Reviews */}
      <div className="review-list-section">
        <h3 className="review-list-title">
          {isGlobal ? "🌟 What Other Travelers Say" : `🌟 Recent Reviews for ${destination}`}
        </h3>

        {loadingReviews && (
          <p style={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center" }}>
            Loading reviews...
          </p>
        )}

        {!loadingReviews && reviews.length === 0 && (
          <p style={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center" }}>
            No reviews yet. Be the first to share your thoughts! 🚀
          </p>
        )}

        <div className="review-cards-grid" style={{ display: "grid", gridTemplateColumns: isGlobal ? "repeat(auto-fill, minmax(350px, 1fr))" : "1fr", gap: "1rem" }}>
          {reviews.map((r, idx) => (
            <div key={idx} className="review-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="review-card-header">
                <div className="review-card-avatar">
                  {(r.name || "U").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="review-card-name">{r.name}</div>
                    <div className="review-card-stars">
                      {renderStars(r.rating, "0.9rem")}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                    <div className="review-card-date">{formatDate(r.date)}</div>
                    {isGlobal && r.destination && (
                      <span style={{ fontSize: "0.7rem", color: "#a78bfa", background: "rgba(167, 139, 250, 0.1)", padding: "2px 6px", borderRadius: "10px", border: "1px solid rgba(167, 139, 250, 0.2)" }}>
                        📍 {r.destination}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="review-card-text">{r.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewFeedback;
