import 'react-loading-skeleton/dist/skeleton.css';
import Navbar from '../components/Navbar';
import ProductInfo from '../page/productPage/productInfo';
import Title from '../components/Title';
import { ScrollRestoration, useLoaderData } from 'react-router-dom';
import Err404 from '../components/Err404';
import { useProduct } from '../hooks/swrhook';
import NetworkError from '../components/NetworkError';
import Footer from '../components/Footer';

export default function ProductInfoRoute() {
  const params = useLoaderData();
  
  // ✅ THE BULLETPROOF FIX
  // We intercept React Router's scrambled params and physically check the strings. 
  // The one containing "TECH" is guaranteed to be the ASIN.
  const correctAsin = params.id?.includes('TECH') ? params.id : params.asin;
  const correctId = params.id?.includes('TECH') ? params.asin : params.id;

  // Now we hand SWR exactly what Express is waiting for!
  const { productData, productError, productLoading } = useProduct({ 
    asin: correctAsin, 
    id: correctId 
  });

  // Safely grab the product using optional chaining
  const productInfo = productData?.data?.product;

  if (productError?.message === 'Network Error') return <NetworkError />;

  if (productError?.response?.status === 404) {
    return <Err404 />;
  }

  if (
    productError?.response?.status === 400 ||
    productError?.response?.status > 404
  ) {
    return (
      <>
        <Navbar />
        <p className="p-lg abs-center">
          {productError?.response?.data?.message || 'Something went wrong'}
        </p>
      </>
    );
  }

  return (
    <>
      <Title title={productInfo?.title || "Loading Product..."} />
      <Navbar />
      <ScrollRestoration />
      
      {productLoading ? (
        <ProductInfo state="loading" />
      ) : (
        <ProductInfo {...productInfo} />
      )}
      
      <Footer />
    </>
  );
}