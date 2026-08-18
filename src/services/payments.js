const PREMIUM_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PREMIUM_PAYMENT_LINK;

function addCheckoutParams(paymentLink, user) {
  const checkoutUrl = new URL(paymentLink);

  checkoutUrl.searchParams.set("client_reference_id", user.uid);

  if (user.email) {
    checkoutUrl.searchParams.set("prefilled_email", user.email);
  }

  return checkoutUrl.toString();
}

export function getPremiumCheckoutUrl(user) {
  if (!PREMIUM_PAYMENT_LINK) {
    throw new Error(
      "Premium checkout is not set up yet. Add VITE_STRIPE_PREMIUM_PAYMENT_LINK to your env file."
    );
  }

  if (!user?.uid) {
    throw new Error("Log in before upgrading to Premium.");
  }

  return addCheckoutParams(PREMIUM_PAYMENT_LINK, user);
}

export function startPremiumCheckout(user) {
  window.location.assign(getPremiumCheckoutUrl(user));
}
