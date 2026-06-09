import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section style={{
      backgroundColor: "#030712", // Ultra-deep midnight slate
      color: "#ffffff",
      padding: "8rem 2rem",
      borderRadius: "0 0 2rem 2rem",
      textAlign: "center",
      marginBottom: "4rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Electric Indigo ambient glow */}
      <div style={{
        position: "absolute",
        top: "-40%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "700px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(3, 7, 18, 0) 70%)",
        zIndex: 0
      }}></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ 
          fontSize: "4.5rem", 
          fontWeight: "900", 
          letterSpacing: "-0.05em",
          margin: "0 0 1rem 0",
          lineHeight: "1.1",
          // Modern Gradient Text
          background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Next-Gen Tech.<br />Delivered Today.
        </h1>
        <p style={{
          fontSize: "1.2rem",
          color: "#94a3b8", // Soft slate gray
          marginBottom: "3rem",
          fontWeight: "400"
        }}>
          Explore our curated collection of premium laptops, immersive audio, and cutting-edge accessories.
        </p>
        
        <Link 
          to="/products?id=13896617011&category=Computers%26Tablets&page=1"
          style={{
            display: "inline-block",
            // Electric Indigo to Cyan Gradient Button
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            color: "#ffffff",
            padding: "1rem 2.5rem",
            borderRadius: "50px", 
            fontWeight: "bold",
            fontSize: "1.1rem",
            textDecoration: "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(99, 102, 241, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(99, 102, 241, 0.4)";
          }}
        >
          Shop Latest Tech
        </Link>
      </div>
    </section>
  );
}