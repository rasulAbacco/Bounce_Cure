// client/src/pages/Pricing/components/StripeWrapper.jsx
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../utils/stripe';
import StripeForm from './Stripe'; // your current Stripe.jsx

function StripePage() {
  return (
    <Elements stripe={stripePromise}>
      <StripeForm />
    </Elements>
  );
}

export default StripePage;
