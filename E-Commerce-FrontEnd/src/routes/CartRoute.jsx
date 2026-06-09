import { Navigate, Link } from "react-router-dom";
import { useUser, usegetProductsFromCart } from "../hooks/swrhook";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import { DisplayErr } from "../utilities/utility";
import CardCart from "../components/CardCart";
import { v4 as uuidv4 } from "uuid";
import emptyCart from "../assets/undraw_empty_cart_co35.svg";
import Footer from "../components/Footer";
import NetworkError from "../components/NetworkError";

export default function CartRoute() {
  const { user, userLoading } = useUser();
  const { cartData, cartLoading, cartError } = usegetProductsFromCart();

  if (cartError?.message === "Network Error") return <NetworkError />;

  if (userLoading === false) {
    if (
      user?.data.message === "Logged out" ||
      cartError?.response?.status === 401 ||
      !user
    )
      return <Navigate to="/login" replace />;
  }

  const cartProducts = cartData?.data?.product?.products;

  // Error boundary layout with sticky footer anchor
  if (cartError?.response?.status === 400 || cartError?.response.status > 404) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Navbar />
        <main style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DisplayErr>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f43f5e" }}>
              {cartError?.response?.data.message || "Something went wrong"}
            </p>
          </DisplayErr>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Navbar />
      <Title title="Shopping cart" />
      
      {/* flexGrow: 1 stretches the main section vertically to force the footer downwards */}
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {cartLoading ? (
          <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "2rem" }}>
            {Array(5)
              .fill(0, 0)
              .map((el, i) => (
                <div key={uuidv4()}>
                  <h1>&nbsp;</h1>
                  <CardCart state="loading" />
                </div>
              ))}
          </div>
        ) : cartProducts.length === 0 ? (
          // Centered modern empty layout message block
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center" }}>
            <img 
              src={emptyCart} 
              alt="Empty Cart" 
              style={{ maxWidth: "250px", width: "100%", marginBottom: "2rem", opacity: 0.8 }} 
              onError={(e) => e.target.style.display = 'none'} 
            />
            <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.03em" }}>
              Your cart is empty!
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "2.5rem" }}>
              Looks like you haven't added any tech to your cart yet.
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
                boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)",
                display: "inline-block"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          // Populated cart element section layout grid
          <section className="section-cart" style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "2rem" }}>
            <h2 
              className="secondary-heading section-cart__heading" 
              style={{ color: "#0f172a", marginBottom: "2rem", fontSize: "2rem", fontWeight: "900", letterSpacing: "-0.03em" }}
            >
              Your shopping cart
            </h2>
            <div className="section-cart__container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {cartProducts.map((products, i) => (
                <CardCart {...products} key={products._id} />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}