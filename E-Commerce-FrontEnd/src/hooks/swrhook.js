import axios from 'axios';
import useSwr from 'swr';
import useSWRImmutable from 'swr/immutable';

let url = import.meta.env.VITE_BACKEND_URL;

// 1. THE GENERAL FETCHER (Put this back!)
// Used for products, search, and cart. It expects everything to work perfectly.
const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

// 2. THE AUTH FETCHER (Your new addition!)
// Used ONLY for the useUser hook. It gracefully handles guests (401 errors).
const authFetcher = (url) =>
  axios.get(url, { withCredentials: true })
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 401) {
        return null; 
      }
      throw err;
    });
export function useUser() {
  const { data, error, mutate } = useSWRImmutable(
    `${url}/users/isLoggedIn`,
    authFetcher, // 2. Use the new custom fetcher here
    {
      errorRetryCount: 1,
      revalidateOnReconnect: true,
    }
  );
  
  return {
    user: data,
    // 3. We changed this from !data to data === undefined. 
    // This ensures that if data is explicitly "null" (guest), it stops loading!
    userLoading: data === undefined && !error, 
    userError: error,
    mutate,
  };
}

export function useHomeProducts() {
  const { data, error } = useSWRImmutable(`${url}/products`, fetcher);
  return {
    homeProductsData: data,
    homeProductsLoading: !error && !data,
    homeProductsError: error,
  };
}

export function useProduct({ asin, id }) {
  const { data, error } = useSWRImmutable(
    `${url}/products/${asin}/${id}`,
    fetcher
  );
  return {
    productData: data,
    productLoading: !error && !data,
    productError: error,
  };
}

export function useSearchProduct(query, page) {
  const { data, error } = useSWRImmutable(
    `${url}/products/search?q=${query}&page=${page}`,
    fetcher
  );
  return {
    searchedProduct: data,
    searchedLoading: !error && !data,
    searchedError: error,
  };
}

export function usegetProductsFromCart() {
  const { data, error } = useSwr(
    `${url}/products/getProductsFromCart`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return {
    cartData: data,
    cartLoading: !error && !data,
    cartError: error,
  };
}

export function useFetchProducts({ id, page, category }) {
  const { data, error } = useSWRImmutable(
    `${url}/products/getProductsFromCategory?id=${id}&page=${page}&category=${category}`,
    fetcher
  );
  return {
    ProductsData: data,
    ProductsLoading: !error && !data,
    ProductsError: error,
  };
}

export function useRecommendations(productId) {
  // Changed to useSwr to perfectly match your import at the top!
  const { data, error, isLoading } = useSwr(
    productId ? `${url}/products/${productId}/recommendations` : null,
    fetcher
  );

  return {
    recommendationsData: data,
    // Added a fallback just in case you are using an older version of SWR
    recommendationsLoading: isLoading || (!error && !data), 
    recommendationsError: error,
  };
}
