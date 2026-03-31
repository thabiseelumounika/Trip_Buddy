import React, { useState, useEffect } from "react";

function ExplorePlaces({ onBack, destination = "India" }) {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const cityAbbreviations = {
      "kkd": "Kakinada",
      "hyd": "Hyderabad",
      "vjw": "Vijayawada",
      "bza": "Vijayawada",
      "bom": "Mumbai",
      "del": "Delhi",
      "maa": "Chennai",
      "blr": "Bangalore",
      "pnq": "Pune",
      "trv": "Trivandrum",
      "cok": "Kochi",
      "vskp": "Visakhapatnam",
      "vizag": "Visakhapatnam"
    };

    const fetchPlaces = async () => {
      try {
        setLoadingGallery(true);
        let searchTerm = destination;
        const lowerDest = destination.toLowerCase().trim();
        
        if (cityAbbreviations[lowerDest]) {
          searchTerm = cityAbbreviations[lowerDest];
        }

        const tryFetch = async (queryText) => {
          const query = encodeURIComponent(queryText);
          const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${query}&gsrlimit=10&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=500&exintro=1&explaintext=1&origin=*`;
          const res = await fetch(wikiUrl);
          return await res.json();
        };

        // Try Stage 1: Specific tourist attractions search
        let data = await tryFetch(`${searchTerm} tourist attractions`);
        
        // Try Stage 2: If no results, try just the search term (city name)
        if (!data.query || !data.query.pages) {
          data = await tryFetch(searchTerm);
        }

        if (data.query && data.query.pages) {
          const rawPlaces = Object.values(data.query.pages)
            .filter(p => p.thumbnail && p.thumbnail.source)
            .map(p => ({
              name: p.title,
              location: searchTerm,
              desc: p.extract || "",
              img: p.thumbnail.source
            }));
          
          setGalleryItems(rawPlaces.slice(0, 6));
        } else {
          setGalleryItems([]);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
        setGalleryItems([]);
      } finally {
        setLoadingGallery(false);
      }
    };
    fetchPlaces();
  }, [destination]);

  return (
    <div className="booking-container" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div className="booking-header" style={{ marginBottom: "2rem" }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="booking-title" style={{ marginTop: "1rem" }}>🌍 Explore Famous Places in {destination}</h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontStyle: "italic" }}>
          Discover iconic landmarks and learn more about your upcoming destination!
        </p>
      </div>

      {/* Gallery Section */}
      <div style={{ marginBottom: "3rem" }}>
        <h3 style={{ color: "#a5f3fc", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📸 Famous Places in {destination}</span>
          {loadingGallery && <span style={{ fontSize: "0.85rem", color: "#fcd34d", fontWeight: "normal" }}>⏳ Loading images...</span>}
        </h3>
        
        {!loadingGallery && galleryItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <img 
              src="/coming-soon.png" 
              alt="Coming Soon" 
              style={{ width: "100%", maxWidth: "450px", borderRadius: "16px", marginBottom: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }} 
            />
            <h3 style={{ color: "#a5f3fc", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Coming Soon! 🚀</h3>
            <p style={{ color: "#9ca3af", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              We're currently gathering the best local highlights and iconic landmarks for <strong>{destination}</strong>. <br />
              Stay tuned, our AI is working on it! 🌏
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {galleryItems.map((place, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
              <img src={place.img} alt={place.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              <div style={{ padding: "1rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>{place.name}</h4>
                <div className="custom-scrollbar" style={{ margin: "0.5rem 0 0", color: "#e2e8f0", fontSize: "0.85rem", lineHeight: "1.4", flexGrow: 1, maxHeight: "120px", overflowY: "auto", paddingRight: "5px" }}>
                  {place.desc}
                </div>
                <p style={{ margin: "0.5rem 0 0", color: "#9ca3af", fontSize: "0.8rem", fontWeight: "bold" }}>📍 {place.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div style={{ marginTop: "3rem", display: "flex", justifyContent: "flex-start", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem" }}>
          <button 
            onClick={onBack}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              border: "none",
              padding: "0.8rem 2.5rem",
              borderRadius: "25px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)"
            }}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExplorePlaces;
