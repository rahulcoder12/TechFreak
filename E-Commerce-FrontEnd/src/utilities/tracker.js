export const logInteraction = async (userId, productId, interactionType) => {
  // Define weights for different actions
  const weights = {
    'view': 1,
    'add_to_cart': 3,
    'checkout_success': 5 
  };

  try {
    await fetch('http://localhost:8000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        weight: weights[interactionType]
      })
    });
  } catch (error) {
    console.error("Failed to log interaction", error);
  }
};
