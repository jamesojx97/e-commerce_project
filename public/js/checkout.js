// checkout.js

document.addEventListener("DOMContentLoaded", function () {

    const stripe = Stripe(stripePublicKey);
    const clientSecret = document.querySelector('form[name="payment-form"]').dataset.secret;
    const options = {
        clientSecret: clientSecret,
        // Fully customizable with appearance API.
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0570de',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'Ideal Sans, system-ui, sans-serif',
                spacingUnit: '2px',
                borderRadius: '4px',
            },
            rules: {
                '.Error': {
                    color: '#fa755a', // Set text color for error messages
                    fontSize: '16px', // Error message font size
                    marginTop: '10px', // Margin above the error message
                    display: 'block', // Make sure it displays 
                },
                '.Tab:hover': {
                    color: 'var(--colorText)',
                },
                '.Tab--selected': {
                    borderColor: '#E0E6EB',
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
                },
            }
        },
    };
    // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained
    const elements = stripe.elements(options);
    // Create and mount the Payment Element
    const paymentElementOptions = { layout: 'accordion'};
    const paymentElement = elements.create('payment', paymentElementOptions);
    paymentElement.mount('#payment-element');
    console.log("Stripe Elements initialization successful.");
    
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: 'http://127.0.0.1:5000/success',
            },
        });

        if (error) {
            button.disabled = false;
            console.error(error);
            alert(error.message);
        } else {
            window.location.href = 'http://127.0.0.1:5000/success?payment_intent=${paymentIntent.id}'; // Successful payment
        }
    });
});
