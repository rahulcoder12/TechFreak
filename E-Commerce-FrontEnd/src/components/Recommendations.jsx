import React from 'react';
import { useRecommendations } from '../hooks/swrhook';
import ProductCard from './ProductCard';
import Skeleton from 'react-loading-skeleton';

export default function Recommendations({ currentProductId }) {
  const { recommendationsData, recommendationsLoading, recommendationsError } = useRecommendations(currentProductId);

  // Don't show the section if there's an error or no recommendations come back
  if (recommendationsError) return null;
  
  const recommendedProducts = recommendationsData?.data?.recommendations || [];

  if (!recommendationsLoading && recommendedProducts.length === 0) return null;

  return (
    <section style={{ 
      maxWidth: "1200px", 
      margin: "4rem auto 2rem auto", 
      padding: "0 2rem",
      width: "100%" 
    }}>
      <h3 style={{ 
        fontSize: "1.8rem", 
        fontWeight: "900", 
        color: "#0f172a", 
        marginBottom: "1.5rem",
        letterSpacing: "-0.02em" 
      }}>
        You might also like
      </h3>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem"
      }}>
        {recommendationsLoading ? (
          // Show 4 loading skeletons while the math engine runs
          Array(4).fill(0).map((_, i) => (
            <ProductCard key={i} state="loading" />
          ))
        ) : (
          // Map out the top 4 mathematically relevant products
          recommendedProducts.map((product) => (
            <ProductCard
              key={product._id}
              img={product.image}
              title={product.title}
              price={product.price?.name}
              rating={product.rating}
              path={`/product/${product.asin}/${product._id}`}
            />
          ))
        )}
      </div>
    </section>
  );
}