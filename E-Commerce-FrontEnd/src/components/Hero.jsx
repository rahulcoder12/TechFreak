import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section style={{
      backgroundColor: "#0a0a0a", // Deep, sleek black
      color: "#ffffff",
      padding: "8rem 2rem",
      borderRadius: "0 0 2rem 2rem",
      textAlign: "center",
      marginBottom: "4rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Subtle background glow effect */}
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0
      }}></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ 
          fontSize: "4rem", 
          fontWeight: "800", 
          letterSpacing: "-0.05em",
          margin: "0 0 1rem 0",
          lineHeight: "1.1"
        }}>
          Next-Gen Tech.<br />Delivered Today.
        </h1>
        <p style={{
          fontSize: "1.2rem",
          color: "#a1a1aa",
          marginBottom: "2.5rem",
          fontWeight: "400"
        }}>
          Explore our curated collection of premium laptops, immersive audio, and cutting-edge accessories.
        </p>
        
        <Link 
          to="/products?category=Computers%26Tablets&page=1"
          style={{
            display: "inline-block",
            backgroundColor: "#ffffff",
            color: "#000000",
            padding: "1rem 2.5rem",
            borderRadius: "50px", // Fully rounded modern pill shape
            fontWeight: "bold",
            fontSize: "1.1rem",
            textDecoration: "none",
            transition: "transform 0.2s ease, boxShadow 0.2s ease",
            boxShadow: "0 4px 14px 0 rgba(255, 255, 255, 0.2)"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          Shop Latest Tech
        </Link>
      </div>
    </section>
  );
}