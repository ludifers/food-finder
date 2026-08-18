const CHOICES_PAYMENT_LINK =
  import.meta.env.VITE_STRIPE_CHOICES_PAYMENT_LINK ||
  import.meta.env.VITE_STRIPE_PREMIUM_PAYMENT_LINK;

function addCheckoutParams(paymentLink, user) {
  const checkoutUrl = new URL(paymentLink);

  checkoutUrl.searchParams.set("client_reference_id", user.uid);

  if (user.email) {
    checkoutUrl.searchParams.set("prefilled_email", user.email);
  }

  return checkoutUrl.toString();
}

export function getChoicesCheckoutUrl(user) {
  if (!CHOICES_PAYMENT_LINK) {
    throw new Error(
      "Checkout is not set up yet. Add VITE_STRIPE_CHOICES_PAYMENT_LINK to your env file."
    );
  }

  if (!user?.uid) {
    throw new Error("Log in before buying more choices.");
  }

  return addCheckoutParams(CHOICES_PAYMENT_LINK, user);
}

export function startChoicesCheckout(user) {
  window.location.assign(getChoicesCheckoutUrl(user));
}
