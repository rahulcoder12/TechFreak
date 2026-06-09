import { useLoaderData, ScrollRestoration } from "react-router-dom";
import { useSearchProduct } from "../hooks/swrhook";
import Footer from "../components/Footer";
import Err404 from "../components/Err404";
import { ProductsBox } from "../components/products";
import Navbar from "../components/Navbar";
import usePagination from "../hooks/paginationHook";
import Pagination from "../components/Pagination";
import { DisplayErr } from "../utilities/utility";
import NetworkError from "../components/NetworkError";

export default function ProductSearchRoute() {
  const { q, pageNumber } = useLoaderData();
  const { handleIncreaseClick, handleDecreaseClick, page } = usePagination(pageNumber);
  const { searchedProduct, searchedLoading, searchedError } = useSearchProduct(q, page);

  if (searchedError?.message === "Network Error") return <NetworkError />;
  const err = searchedError?.response?.data?.message;
  
  if (searchedError?.response?.status === 404) return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.03em" }}>
          No more results!
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "2.5rem" }}>
          There are no more products matching your search on this page.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "#0ea5e9", 
            color: "#ffffff", 
            padding: "0.8rem 2.5rem", 
            borderRadius: "50px", 
            border: "none", 
            fontWeight: "bold", 
            fontSize: "1.05rem", 
            cursor: "pointer", 
            transition: "all 0.2s ease",
            boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          Go Back
        </button>
      </main>
      <Footer />
    </div>
  );

  if (searchedError?.response?.status === 400 || searchedError?.response?.status > 404) return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <DisplayErr>
        <p className="message">{err}</p>
      </DisplayErr>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <ScrollRestoration getKey={(location) => location.key} />
      
      {/* Modern Centered Main Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem", flexGrow: 1, width: "100%" }}>
        {searchedLoading ? (
          <ProductsBox state="loading" />
        ) : (
          <section className="featured-products">
            {/* Sleek Modern Header */}
            <div style={{ marginBottom: "3rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
              <p style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                Search Results
              </p>
              <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.03em" }}>
                "{q}"
              </h1>
            </div>

            <ProductsBox
              data={searchedProduct.data.searchedProduct}
            />
            
            <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center" }}>
              <Pagination
              increase={handleIncreaseClick}
              decrease={handleDecreaseClick}
              page={page}
              route={`/products/search?q=${q}&page`}
              dataLength={searchedProduct.data.searchedProduct.length} // <-- Add this!
            />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}