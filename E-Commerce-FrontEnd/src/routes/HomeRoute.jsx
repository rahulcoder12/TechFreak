import { ScrollRestoration, useLocation } from 'react-router-dom';
import { Fragment } from 'react'; 
import Navbar from '../components/Navbar';
import Title from '../components/Title';
import Hero from '../page/homePage/Hero';
import { Features } from '../page/homePage/features';
import { ProductsBox } from '../components/products';
import { Details } from '../page/homePage/Details';
import { ButtonLink } from '../components/Button';
import Footer from '../components/Footer';
import { useHomeProducts } from '../hooks/swrhook';
import NetworkError from '../components/NetworkError';
import Skeleton from 'react-loading-skeleton';

export default function HomeRoute() {
  const location = useLocation();
  const { homeProductsData, homeProductsError, homeProductsLoading } = useHomeProducts();

  if (homeProductsError?.message === 'Network Error') return <NetworkError />;
  if (homeProductsError?.response?.status > 404)
    return (
      <>
        <Navbar />
        <p className="p-lg abs-center">
          {homeProductsError?.response?.data.message || 'Something went wrong'}
        </p>
      </>
    );

  // THE REAL FIX: Your backend already groups the data perfectly!
  // We just grab the data object exactly as the server sends it.
  const allCategories = homeProductsData?.data || {};

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      
      {homeProductsLoading ? (
        <div style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 2rem" }}>
          <Skeleton height={400} borderRadius="2rem" style={{ marginBottom: "2rem" }} />
          <ProductsBox state="loading" />
        </div>
      ) : (
        <>
          <Title title="Start Shopping Tech" />
          <Hero />
          <Features />
          
          <ScrollRestoration
            getKey={(location, matches) => {
              return location.key;
            }}
          />
          
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            
            {/* The Magic Loop runs beautifully on your server's data */}
            {Object.entries(allCategories).map(([categoryName, productsArray], index) => {
              const categoryId = productsArray[0]?.categories[0]?.id || "";

              return (
                <Fragment key={categoryName}>
                  <section style={{ marginBottom: "5rem", width: "100%", display: "block" }}>
                    
                    <ProductsBox title={`Premium ${categoryName}`} data={productsArray} />
                    
                    <div className="featured-products__btn-box" style={{ textAlign: "center", marginTop: "2rem" }}>
                      <ButtonLink
                        link={`/products?id=${categoryId}&category=${encodeURIComponent(categoryName)}&page=1`}
                        title={`Explore ${categoryName}`}
                        nameClass="featured-products__button"
                      />
                    </div>
                  </section>

                  {/* This is currently throwing a 404, we will fix it next! */}
                  {index === 0 && <Details />}
                </Fragment>
              );
            })}

          </main>
          <Footer />
        </>
      )}
    </div>
  );
}