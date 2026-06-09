import ProductCard from "./ProductCard";
import Skeleton from "react-loading-skeleton";

export function ProductsBox({ data, title, state }) {
  const items = state === "loading" ? Array(8).fill(0) : (data || []);
  
  if (items.length === 0 && state !== "loading") return null;

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: "2rem" }}>
      
      {state === "loading" ? (
        <div style={{ marginBottom: "2rem" }}>
            <Skeleton count={1} height={40} width={"30%"} />
        </div>
      ) : (
        title && (
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "2rem" }}>
            {title}
          </h2>
        )
      )}

      {/* THE FORCE-RENDER GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "2rem",
        width: "100%",
        /* Overrides any carousel overflow bugs */
        overflow: "visible", 
        position: "relative"
      }}>
        {items.map((el, index) =>
          state === "loading" ? (
            <ProductCard state={state} key={`skeleton-${index}`} />
          ) : (
            // Wrapping the card in a block div forces it to take up the correct space!
            <div key={el._id || index} style={{ display: "block", height: "100%" }}>
                <ProductCard
                  title={el.title ? el.title.slice(0, 40) + "..." : "Tech Product"} 
                  img={el.image} 
                  price={`$${el.price?.value || 99.99}`}
                  path={`/product/${el._id}/${el.asin}`} 
                  rating={el.rating || 4.5}
                />
            </div>
          )
        )}
      </div>
    </div>
  );
}