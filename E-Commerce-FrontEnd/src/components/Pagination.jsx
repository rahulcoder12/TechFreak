import { Link } from "react-router-dom";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

export default function Pagination({ increase, decrease, page, route, dataLength }) {
  // THE LOGIC FIX: 
  // If the backend returns less than 8 items, we are at the end of the list.
  const isLastPage = dataLength < 8;
  const isFirstPage = page <= 1;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: "50px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid #e2e8f0",
      overflow: "hidden"
    }}>
      {/* Previous Button */}
      <Link
        to={isFirstPage ? "#" : `${route}=${page - 1}`}
        onClick={(e) => {
          if (isFirstPage) e.preventDefault();
          else decrease();
        }}
        style={{
          padding: "0.8rem 1.5rem",
          backgroundColor: isFirstPage ? "#f8fafc" : "#ffffff",
          color: isFirstPage ? "#cbd5e1" : "#0f172a", // Grays out if disabled
          pointerEvents: isFirstPage ? "none" : "auto", // Physically disables clicking
          cursor: isFirstPage ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s ease",
          textDecoration: "none",
          borderRight: "1px solid #e2e8f0"
        }}
        onMouseOver={(e) => { if (!isFirstPage) e.currentTarget.style.backgroundColor = "#f1f5f9" }}
        onMouseOut={(e) => { if (!isFirstPage) e.currentTarget.style.backgroundColor = "#ffffff" }}
      >
        <BsArrowLeft size={20} />
      </Link>

      {/* Current Page Number */}
      <div style={{
        padding: "0.8rem 1.5rem",
        fontWeight: "800",
        fontSize: "1.1rem",
        color: "#0f172a",
        minWidth: "60px",
        textAlign: "center",
        backgroundColor: "#ffffff"
      }}>
        {page}
      </div>

      {/* Next Button */}
      <Link
        to={isLastPage ? "#" : `${route}=${page + 1}`}
        onClick={(e) => {
          if (isLastPage) e.preventDefault();
          else increase();
        }}
        style={{
          padding: "0.8rem 1.5rem",
          backgroundColor: isLastPage ? "#f8fafc" : "#ffffff",
          color: isLastPage ? "#cbd5e1" : "#0f172a", // Grays out if disabled
          pointerEvents: isLastPage ? "none" : "auto", // Physically disables clicking
          cursor: isLastPage ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s ease",
          textDecoration: "none",
          borderLeft: "1px solid #e2e8f0"
        }}
        onMouseOver={(e) => { if (!isLastPage) e.currentTarget.style.backgroundColor = "#f1f5f9" }}
        onMouseOut={(e) => { if (!isLastPage) e.currentTarget.style.backgroundColor = "#ffffff" }}
      >
        <BsArrowRight size={20} />
      </Link>
    </div>
  );
}