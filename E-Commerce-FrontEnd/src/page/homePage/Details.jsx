import { Link } from 'react-router-dom';

export function Details() {
  return (
    <section style={{
      // Deep Violet to Indigo sweep
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", 
      borderRadius: "2rem",
      padding: "5rem 2rem",
      margin: "4rem 0",
      textAlign: "center",
      color: "#ffffff",
      boxShadow: "0 25px 50px -12px rgba(49, 46, 129, 0.5)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Cyan geometric accent */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.15) 0%, rgba(0,0,0,0) 60%)",
        pointerEvents: "none"
      }}></div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
          Build Your Dream Setup.
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#a5b4fc", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          From high-performance gaming rigs to ultra-light workstations, we have the gear you need to elevate your workflow.
        </p>
        
        <Link 
          // Safely points to the newly scraped Laptops category!
          to="/products/search?q=Laptops&page=1"
          style={{
            display: "inline-block",
            // Electric Cyan Button
            backgroundColor: "#06b6d4", 
            color: "#ffffff",
            padding: "0.9rem 2.5rem",
            borderRadius: "50px",
            fontWeight: "bold",
            fontSize: "1.05rem",
            textDecoration: "none",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 14px 0 rgba(6, 182, 212, 0.39)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#0891b2";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#06b6d4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          View Laptops
        </Link>
      </div>
    </section>
  );
}