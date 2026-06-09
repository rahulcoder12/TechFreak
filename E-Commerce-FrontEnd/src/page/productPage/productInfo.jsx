import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { logInteraction } from "../../utilities/tracker";
import { useState, useRef, useEffect } from 'react';
import { Rating } from 'react-simple-star-rating';
import Skeleton from 'react-loading-skeleton';
import { useSWRConfig } from 'swr';
import { Button } from '../../components/Button';
import { useUser } from '../../hooks/swrhook';
import { changeImageWidth } from '../../utilities/utility';
import { sendRequestToBackend } from '../../utilities/utility';
import { renderToastify, updateToastify } from '../../utilities/toastify';
import { toast } from 'react-toastify';

// 1. IMPORT THE NEW ML COMPONENT
import Recommendations from "../../components/Recommendations";

export default function ProductInfo(props) {
  const [btnAction, setBtnAction] = useState(false);
  const refId = useRef(null);
  const { mutate } = useSWRConfig();
  const { user, isLoading, isError } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleAddToCart() {
    if (!user?.message) {
      toast('You need to be logged in to perform this action', {
        type: 'warning',
      });
      return navigate('/login', {
        state: location,
        relative: 'path',
      });
    }
    try {
      refId.current = renderToastify('Adding to cart...');
      setBtnAction(true);
      await sendRequestToBackend(
        'patch',
        'products',
        { id: props._id },
        'addToCart'
      );
      
      // ✅ FIXED: Safely drilling into the correct Mongoose object structure
      const userId = user?.data?.user?._id;
      
      if (userId) {
        logInteraction(userId, props._id, 'add_to_cart');
      }

      setBtnAction(false);
      updateToastify(refId.current, 'Product added to cart', 'success');
      await mutate(`${import.meta.env.VITE_BACKEND_URL}/users/isLoggedIn`);
    } catch (err) {
      updateToastify(refId.current, err.response?.data?.message || "Error adding to cart", 'error');
      setBtnAction(false);
    }
  }

  useEffect(() => {
    if (user && props._id) {
      // ✅ FIXED: Same safe extraction here!
      const userId = user?.data?.user?._id; 
      
      if (userId) {
        logInteraction(userId, props._id, 'view');
      }
    }
  }, [user, props._id]);

  return (
    <>
      <section className="product-info">
        <div className="product-info__container">
          <div className="product-info__img-box">
            {props.state === 'loading' ? (
              <Skeleton count={25} />
            ) : (
              <img
                className="product-info__img"
                // Note: DummyJSON URLs don't have 'UL320' tags like Amazon did.
                // changeImageWidth won't break, but it will just return the original URL.
                src={changeImageWidth(props.image?.slice(), 'UL320', 'UL660')}
                alt={props.title}
              />
            )}
          </div>

          <div className="product-info__details">
            <p className="product-info__category">
              {props.state === 'loading' ? (
                <Skeleton />
              ) : (
                props.categories?.[0]?.name
              )}
            </p>
            <h2 className="secondary-heading product-info__heading">
              {props.state === 'loading' ? <Skeleton /> : props.title}
            </h2>
            <div className="product-info__rating-box">
              <Rating
                readonly={true}
                initialValue={Number(props.rating)}
                allowFraction={true}
              />
              <p className="product-info__rating">
                {props.state === 'loading' ? <Skeleton /> : props.rating}
              </p>
            </div>
            
            <div className="product-info__action">
              {props.state === 'loading' ? (
                <Skeleton />
              ) : (
                <>
                  <Button
                    onClick={handleAddToCart}
                    msg="Add to cart"
                    nameClass="primary-button"
                    style={btnAction ? 'processing' : 'idle'}
                    isDisabled={btnAction}
                  />
                  <p className="product-info__price">{props.price?.name}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. INJECT THE RECOMMENDATIONS ENGINE HERE */}
      {props._id && props.state !== 'loading' && (
        <Recommendations currentProductId={props._id} />
      )}
    </>
  );
}