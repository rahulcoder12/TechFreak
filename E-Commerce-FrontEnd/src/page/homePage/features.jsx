import { BsTruck, BsShieldCheck, BsArrowCounterclockwise } from 'react-icons/bs';
import { useState } from 'react';

function FeatureCard({ icon, title, description }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        // Glowing colored shadow and border on hover
        boxShadow: isHovered 
          ? "0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        border: isHovered ? "1px solid #818cf8" : "1px solid #f1f5f9"
      }}
    >
      <div style={{
        // Soft colored background for the icon
        backgroundColor: isHovered ? "#e0e7ff" : "#f8fafc",
        padding: "1rem",
        borderRadius: "50%",
        marginBottom: "1.5rem",
        // Indigo icon color
        color: "#4f46e5",
        transition: "background-color 0.3s ease"
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "0 0 0.5rem 0", color: "#0f172a" }}>
        {title}
      </h3>
      <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
        {description}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section style={{ maxWidth: "1200px", margin: "-2rem auto 4rem auto", padding: "0 2rem", position: "relative", zIndex: 10 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem"
      }}>
        <FeatureCard 
          icon={<BsTruck size={32} />} 
          title="Free Shipping" 
          description="Capped at $60 an hour" 
        />
        <FeatureCard 
          icon={<BsShieldCheck size={32} />} 
          title="Secure Payments" 
          description="6 months installments" 
        />
        <FeatureCard 
          icon={<BsArrowCounterclockwise size={32} />} 
          title="14 Day Returns" 
          description="Shop with confidence" 
        />
      </div>
    </section>
  );
}