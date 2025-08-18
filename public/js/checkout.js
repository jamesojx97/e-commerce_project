// checkout.js

document.addEventListener("DOMContentLoaded", function () {

    const stripe = Stripe(stripePublicKey);
    const options = {
        layout: {
            type: 'tabs',
            defaultCollapsed: false,
        }
    }
    // Customize with Appearance API.
    const appearance = {
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
    };

    const option = { mode: 'shipping' };
    var elements = stripe.elements({
        clientSecret: client_secret,
        appearance: appearance
    });
    // Create Address Element
    const addressElement = elements.create('address', option);
    addressElement.mount('#address-element');

    // Create Payment Element
    const paymentElement = elements.create('payment', options);
    paymentElement.mount('#payment-element'); 

    // Create Link Authentication Element
    const linkAuthenticationElement =  elements.create('linkAuthentication') 
    linkAuthenticationElement.mount("#link-authentication-element"); 


    // Define form variable here to ensure it exists
    const form = document.getElementById('payment-form');
    const handleError = (error) => {
        const messageContainer = document.querySelector('#error-message');
        if (messageContainer){
            let userMessage = 'An unexpected error occurred. Please try again.';
            // Extract the specific error message from the raw response
            if (error.message) {
                const parts = error.message.split(': ');
                if (parts.length > 1) {
                    userMessage = parts[1];
                } else {
                    userMessage = error.message;
                }
            }
            // Style the message
            messageContainer.innerHTML = `<div class="alert alert-danger" role="alert"><strong>${userMessage}</strong></div>`;
        }
    };

    let addressComplete = false;
    let paymentComplete = false;
    let emailComplete = false;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    // Function to check the form's completeness and enable the button.
    function updateButtonState(){
        button.disabled = !(addressComplete && paymentComplete && emailComplete);
    };
    
    // Add a listener to detect the selected payment method
    let selectedPaymentMethodType = 'card'; // Default to card
    paymentElement.on('change', (event) => {
        selectedPaymentMethodType = event.value.type;
        console.log('Selected payment method:', selectedPaymentMethodType);

        paymentComplete = event.complete; // 'complete' is true if the payment details are valid
        updateButtonState();
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

    addressElement.on('change', (event) => {
        addressComplete = event.complete; // 'complete' is true if all required fields are filled and valid
        updateButtonState();
        if (event.error) {
            handleError(event.error);
        }
    });

    linkAuthenticationElement.on('change', (event) => {
        emailComplete = event.complete; // 'complete' is true if all required fields are filled and valid
        updateButtonState();
        if (event.error) {
            handleError(event.error);
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

            const successUrl = `/success?payment_intent=${payment_intent_id}&amount=${amount}&currency=${currency}}`
            if (selectedPaymentMethodType === 'card' || selectedPaymentMethodType === 'link') {
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