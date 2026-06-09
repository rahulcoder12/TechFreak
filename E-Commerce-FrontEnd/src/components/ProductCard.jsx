import { useState } from "react";
import { Rating } from "react-simple-star-rating";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

export default function ProductCard({
  img,
  title,
  price,
  nameClass,
  path,
  rating,
  state,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // THE FIX: Scrub the raw database string to remove all trailing dots
  const cleanTitle = title ? title.replace(/\.+$/, "").trim() : "";

  return (
    <figure
      className={nameClass || ""} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "1rem", 
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid #f3f4f6",
        margin: "0",
      }}
    >
      <Link
        to={state === "loading" ? "#" : path}
        style={{ 
          textDecoration: "none", 
          color: "inherit", 
          display: "flex", 
          flexDirection: "column", 
          height: "100%" 
        }}
      >
        {/* Image Container */}
        <div style={{ 
          padding: "1.5rem", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          backgroundColor: "#ffffff", 
          height: "220px",
          overflow: "hidden"
        }}>
          {state === "loading" ? (
            <Skeleton height={150} width={150} />
          ) : (
            <img
              src={img}
              alt={cleanTitle}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            />
          )}
        </div>

        {/* Details Container */}
        <figcaption
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            borderTop: "1px solid #f3f4f6",
            backgroundColor: "#fafafa" 
          }}
        >
          {/* Title */}
          <p
            style={{
              fontWeight: "600",
              fontSize: "1rem",
              color: "#1f2937",
              margin: "0 0 0.75rem 0",
              display: "-webkit-box",
              WebkitLineClamp: 2, 
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "2.8rem" 
            }}
          >
            {state === "loading" ? <Skeleton count={2} /> : cleanTitle}
          </p>

          {/* Rating Section */}
          <div
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              marginBottom: "1.5rem", 
              fontSize: "0.875rem", 
              color: "#6b7280" 
            }}
          >
            <Rating
              readonly={true}
              initialValue={state === "loading" ? 5 : rating}
              allowFraction={true}
              size={16}
              fillColor="#fbbf24"
              emptyColor="#e5e7eb"
            />
            <p style={{ margin: 0 }}>
              {state === "loading" ? <Skeleton width={30} /> : `(${rating || 0})`}
            </p>
          </div>

          {/* Price & Action Badge */}
          <div style={{ 
            marginTop: "auto", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <p
              style={{
                fontWeight: "800",
                fontSize: "1.25rem",
                color: "#111827",
                margin: 0,
              }}
            >
              {state === "loading" ? <Skeleton width={60} /> : price}
            </p>

            {/* The Slide-In "View" Badge */}
            {!state || state !== "loading" ? (
              <div style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateX(0)" : "translateX(10px)",
                transition: "all 0.3s ease",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "0.4rem 1rem",
                borderRadius: "2rem",
                fontSize: "0.8rem",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                View
              </div>
            ) : null}
          </div>
        </figcaption>
      </Link>
    </figure>
  );
}