import { MdOutlineCancel } from "react-icons/md";
import { useSWRConfig } from "swr";
import { useUser } from "../hooks/swrhook";
import { renderToastify, updateToastify } from "../utilities/toastify";
import { sendRequestToBackend } from "../utilities/utility";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useState } from "react";

export default function CardCart(props) {
  const { user, userLoading, userError } = useUser();
  const { mutate } = useSWRConfig();
  const [deleteItem, setDeleteItem] = useState(false);
  const navigate = useNavigate();

  async function handleDelete(id) {
    const idToast = renderToastify("Deleting item...");
    setDeleteItem(true);
    try {
      const response = await sendRequestToBackend(
        "patch",
        "products",
        { id },
        "deleteProductFromCart"
      );
      const cartResponse = await mutate(
        `${import.meta.env.VITE_BACKEND_URL}/products/getProductsFromCart`
      );
      if (cartResponse.message === "products from cart loaded")
        setDeleteItem(false);
      mutate(`${import.meta.env.VITE_BACKEND_URL}/users/isLoggedIn`);
      updateToastify(idToast, "Item removed from cart", "success");
    } catch (err) {
      setDeleteItem(false);
      updateToastify(
        idToast,
        "something went wrong while trying to remove item",
        "error"
      );
    }
  }

  function handleProcessStripe(e, link) {
    e.preventDefault();
    user.data.user.active === false
      ? toast("Your account must be active to perform this action", {
          type: "error",
        })
      : navigate(link);
  }

  // --- THE GHOST ITEM FIX ---
  // If the product is missing from the database, render a safe fallback UI instead of crashing
  if (props.state !== "loading" && !props.products) {
    return (
      <div style={{
        padding: "1.5rem",
        backgroundColor: "#fff1f2", // Subtle red warning background
        border: "1px dashed #fda4af",
        borderRadius: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
           <div style={{
             width: "50px",
             height: "50px",
             backgroundColor: "#fecdd3",
             borderRadius: "0.5rem",
             display: "flex",
             justifyContent: "center",
             alignItems: "center",
             color: "#e11d48",
             fontWeight: "bold",
             fontSize: "1.5rem"
           }}>!</div>
           <div>
             <p style={{ color: "#be123c", fontWeight: "800", margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>
               Item Unavailable
             </p>
             <p style={{ color: "#9f1239", margin: 0, fontSize: "0.9rem" }}>
               This product is no longer in our store.
             </p>
           </div>
        </div>
        
        <button 
          onClick={() => handleDelete(props._id)} 
          disabled={deleteItem}
          style={{
            backgroundColor: "#e11d48",
            color: "#ffffff",
            border: "none",
            padding: "0.6rem 1.5rem",
            borderRadius: "50px",
            fontWeight: "bold",
            cursor: deleteItem ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: deleteItem ? 0.7 : 1
          }}
          onMouseOver={(e) => { if(!deleteItem) e.currentTarget.style.backgroundColor = "#be123c" }}
          onMouseOut={(e) => { if(!deleteItem) e.currentTarget.style.backgroundColor = "#e11d48" }}
        >
          {deleteItem ? "Removing..." : "Remove Item"}
        </button>
      </div>
    );
  }

  return (
    <div className="section-cart__card">
      <div className="section-cart__details">
        {props.state === "loading" ? (
          <Skeleton />
        ) : (
          <div className="section-cart__img-box">
            <img
              className="section-cart__img"
              src={props.products.image}
              alt={props.products.title}
            />
          </div>
        )}
        <div className="section-cart__description">
          <p className="section-cart__title">
            {props.state === "loading" ? (
              <Skeleton />
            ) : (
              props.products.title.slice(0, 14)
            )}
            ...
          </p>
          <p className="section-cart__id">
            Ref:{" "}
            {props.state === "loading" ? (
              <Skeleton />
            ) : (
              props.products.categories[0].id
            )}
          </p>
        </div>
      </div>
      <p className="section-cart__category">
        {props.state === "loading" ? (
          <Skeleton />
        ) : (
          props.products.categories[0].name
        )}
      </p>
      <div className="section-cart__price">
        {props.state === "loading" ? (
          <Skeleton />
        ) : props.products.price.symbol && props.products.price.value ? (
          props.products.price.symbol + "" + props.products.price.value
        ) : (
          props.products.price.name
        )}
      </div>
      
      {/* Updated Action Section */}
      <div className="section-cart__action">
        <button
          style={{ fontSize: "inherit", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => handleDelete(props._id)}
          disabled={deleteItem}
          title="Remove from cart"
        >
          <MdOutlineCancel className="section-cart__cancel" style={{ color: "#fa5252", fontSize: "24px", opacity: deleteItem ? 0.5 : 1 }} />
        </button>
        
        <Link
          to={`/${props._id}/process-checkout`}
          onClick={(e) =>
            handleProcessStripe(e, `/${props._id}/process-checkout`)
          }
          style={{ textDecoration: "none" }}
        >
          <button 
          style={{ 
            backgroundColor: "#1c7ed6", 
            color: "#fff", 
            border: "none", 
            padding: "8px 16px", 
            borderRadius: "5px", 
            cursor: "pointer", 
            fontWeight: "bold",
            marginLeft: "15px"
          }}
        >
          Buy Now
        </button>
        </Link>
      </div>
    </div>
  );
}