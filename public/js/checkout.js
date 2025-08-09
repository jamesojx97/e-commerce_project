// checkout.js

document.addEventListener("DOMContentLoaded", function () {

    const stripe = Stripe(stripePublicKey);
    const clientSecret = document.querySelector('form[name="payment-form"]').dataset.secret;
    const options = {
        clientSecret: clientSecret,
        // Fully customizable with appearance API.
        appearance: {/*...*/},
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
