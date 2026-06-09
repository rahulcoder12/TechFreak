import { useLoaderData, Navigate } from "react-router-dom";
import { useSWRConfig } from "swr";
import { useEffect } from "react";
import { logInteraction } from '../utilities/tracker';
import Err404 from "../components/Err404";
import Title from "../components/Title";
import Navbar from "../components/Navbar";
import { useUser } from "../hooks/swrhook";
import NetworkError from "../components/NetworkError";
import { Checkmark } from "react-checkmark";

export default function PaymentSuccess() {
  const data = useLoaderData();
  const { mutate } = useSWRConfig();
  const { user, userLoading } = useUser();

  useEffect(() => {
    // 1. We need to find where the purchased items are stored. 
    // Usually, they are returned in your loader data after a successful payment.
    // console.log("Success Page Data:", data); // <-- Uncomment this if you need to find the exact path
    
    // Adjust this path based on how your backend returns the order!
    // It might be data?.order?.items, or user?.cart if it hasn't cleared yet.
    const purchasedItems = data?.data?.items || []; 

    // 2. Verify you have a logged-in user and items to track
    if (user && purchasedItems.length > 0) {
      const userId = user._id || user.id;

      if (userId) {
        // 3. Loop through and track each item
        purchasedItems.forEach((item) => {
          const productId = item._id || item.id || item.product?._id;
          
          if (productId) {
            logInteraction(userId, productId, 'checkout_success');
          }
        });
      }
    }
  }, [user, data]); // Add data to the dependency array instead of cartItems

  if (data?.err?.message === "Network Error") return <NetworkError />;
  if (data?.status !== 200) {
    return (
      <>
        <Err404 />
        <Title title="404 page not found" />
      </>
    );
  }

  if (!userLoading) {
    if (data?.status === 401 || !user || user?.data.message === "Logged out")
      return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Title title="payment success" />
      <div className="abs-center payment-success_box">
        <Checkmark size="xxLarge" color="#223344" />
        <p className="c-mark">
          Your order has been processed. Please check your email box for more
          details.
        </p>
      </div>
    </>
  );
}
