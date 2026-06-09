import { useLoaderData, ScrollRestoration } from "react-router-dom";
import { useFetchProducts } from "../hooks/swrhook";
import Navbar from "../components/Navbar";
import { ProductsBox } from "../components/products";
import { DisplayErr } from "../utilities/utility";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import usePagination from "../hooks/paginationHook";
import NetworkError from "../components/NetworkError";

export default function ProductsRoute() {
  const searchParamsData = useLoaderData();
  const { ProductsData, ProductsLoading, ProductsError } = useFetchProducts(searchParamsData);
  const { handleIncreaseClick, handleDecreaseClick, page } = usePagination(searchParamsData.page);

  if (ProductsError?.message === "Network Error") return <NetworkError />;

  // 1. Graceful 404 Handling (Sends the user safely back home)
  if (ProductsError?.response?.status === 404) return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.03em" }}>
          Category Not Found
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "2.5rem" }}>
          It looks like this tech category doesn't exist anymore.
        </p>
        <button 
          // Force them back to the safe root URL!
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: "#0ea5e9", color: "#ffffff", padding: "0.8rem 2.5rem", borderRadius: "50px", border: "none", fontWeight: "bold", fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)"
          }}
        >
          Back to Home
        </button>
      </main>
      <Footer />
    </div>
  );

  const err = ProductsError?.response?.data?.message;
  if (ProductsError?.response?.status >= 400) return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <DisplayErr>
        <p style={{ color: "#f43f5e", fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{err}</p>
      </DisplayErr>
    </div>
  );

  // 2. The Clean Formatting (No more hardcoded ghosts!)
  const displayName = decodeURIComponent(searchParamsData.category || "Tech");

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollRestoration getKey={(location) => location.key} />
      <Navbar />
      
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem", flexGrow: 1, width: "100%" }}>
        {ProductsLoading ? (
          <ProductsBox state="loading" />
        ) : ProductsData?.data?.foundProducts?.length === 0 ? (
          <DisplayErr>
            <h2 style={{ fontSize: "2rem", color: "#0f172a" }}>No products found</h2>
            <p style={{ color: "#64748b" }}>Try adjusting your search filters.</p>
          </DisplayErr>
        ) : (
          <section className="featured-products">
            <div style={{ marginBottom: "3rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
              <p style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                Browsing Category
              </p>
              <h1 style={{ margin: 0, fontSize: "2.8rem", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.03em" }}>
                {displayName}
              </h1>
            </div>

            <ProductsBox data={ProductsData.data.foundProducts} />
            
            <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center" }}>
              <Pagination
                increase={handleIncreaseClick}
                decrease={handleDecreaseClick}
                page={page}
                route={`/products/?id=${searchParamsData.id}&category=${searchParamsData.category}&page`}
                dataLength={ProductsData.data.foundProducts.length} 
              />
            </div> 
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}