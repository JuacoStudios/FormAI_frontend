'use client';

export default function SuccessPage() {
  const plan = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('plan')
    : null;

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Thanks for your purchase! 🎉</h1>
      <p className="mt-4">
        Your {plan ?? 'premium'} plan payment was received. We'll activate your premium access shortly.
      </p>
      <p className="mt-2">
        If you don't see Premium unlocked within a few minutes, please contact support with your payment email.
      </p>
      <a className="btn mt-6" href="mailto:support@formai.app?subject=Activate Premium">
        Contact Support
      </a>
    </main>
  );
}

