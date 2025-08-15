// checkout.js

document.addEventListener("DOMContentLoaded", function () {

    const stripe = Stripe(stripePublicKey);
    const options = {
        clientSecret: client_secret,
        // Customize with Appearance API.
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
                    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(19, 46, 73, 0.02), 0 0 0 2px var(--colorPrimary)',
                },
            }
        },
    };

    // Define form variable here to ensure it exists
    const form = document.getElementById('payment-form');
    const handleError = (error) => {
        const messageContainer = document.querySelector('#error-message');
        if (messageContainer) {
            messageContainer.textContent = error.message; // Display the error message
            // Note: The 'button' variable is not in scope here.
            // You might need to pass it or define it in a higher scope.
            // button.disabled = false; // Re-enable button on error
        }
    };

    const button = form.querySelector('button[type="submit"]');
    // Initially disable the button
    button.disabled = true;
    
    // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained
    const elements = stripe.elements(options); // Initialize Elements
    const paymentElement = elements.create('payment'); // Create the payment element
    paymentElement.mount('#payment-element'); // Mount the payment element to the DOM

    // Add a listener to detect the selected payment method
    let selectedPaymentMethodType = 'card'; // Default to card
    paymentElement.on('change', (event) => {
        selectedPaymentMethodType = event.value.type;
        console.log('Selected payment method:', selectedPaymentMethodType);
        // Check if the payment fields are complete and valid
        if (event.complete) {
            button.disabled = false; // Enable the button
        } else {
            button.disabled = true; // Disable the button
        }
        // Show any validation errors from Stripe Elements
        if (event.error) {
            handleError(event.error);
        } else {
            // Clear any existing error messages if the input is now valid
            const messageContainer = document.querySelector('#error-message');
            if (messageContainer) {
                messageContainer.textContent = "";
            }
        }
    });

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form from submitting normally
            const button = form.querySelector('button[type="submit"]');
            button.disabled = true; // Disable the button to prevent multiple submissions

            // Trigger form validation and wallet collection
            const { error: submitError } = await elements.submit();
            if (submitError) {
                handleError(submitError);
                return; // Early exit on error
            }

            const successUrl = `/success?payment_intent=${payment_intent_id}&amount=${amount}&currency=${currency}&status=${payment_status}`
            if (selectedPaymentMethodType === 'card') {
                // Confirm Payment Intent with Card
                try {
                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: window.location.origin + successUrl,
                        },
                    });

                    if (error) {
                        handleError(error);
                    }
                } 
                catch (error) {
                    handleError(error);
                }
            } 
            else if (selectedPaymentMethodType === 'grabpay') {          
                // Confirm Payment Intent with GrabPay
                stripe.confirmGrabPayPayment(client_secret, {
                    // Return URL where customer should be redirected after the authorization
                    return_url: window.location.origin + successUrl,
                });
            } 
            else if (selectedPaymentMethodType === 'alipay') {
            // Confirm Payment Intent with Alipay
                stripe.confirmAlipayPayment(client_secret, {
                    // Return URL where the customer should be redirected after the authorization
                    return_url: window.location.origin + successUrl,
                });
            }
        });
    }
    else {
        console.error("Form with ID 'payment-form' not found!"); // Log if form is not found
    }
});