import { Link } from "react-router-dom";

import errorImg from "../assets/undraw_page_not_found_re_e9o6.svg";

export default function Err404() {
  return (
    <main style={{ 
      flexGrow: 1, 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "4rem 2rem", 
      textAlign: "center",
      width: "100%"
    }}>
      
      <img 
        src={errorImg} 
        alt="Page Not Found" 
        style={{ maxWidth: "500px", width: "100%", marginBottom: "2rem" }} 
        onError={(e) => e.target.style.display = 'none'} // Safety net! Hides image if the path is wrong
      />
      
      <h2 style={{ fontSize: "3rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.03em" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "2.5rem", maxWidth: "500px" }}>
        Oops! It looks like the page you are looking for has been moved or no longer exists.
      </p>

      <Link 
        to="/"
        style={{
          backgroundColor: "#0ea5e9", 
          color: "#ffffff", 
          padding: "0.8rem 2.5rem", 
          borderRadius: "50px", 
          textDecoration: "none",
          fontWeight: "bold", 
          fontSize: "1.05rem", 
          transition: "all 0.2s ease",
          boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
      >
        Back to Home
      </Link>
    </main>
  );
}