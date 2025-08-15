import os
import stripe

from dotenv import load_dotenv
from flask import Flask, request, render_template

load_dotenv()

app = Flask(__name__,
  static_url_path='',
  template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "views"),
  static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "public"))

# Set env variables
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')  # Get the Stripe secret key

# Home route
@app.route('/', methods=['GET'])
def index():
  return render_template('index.html')

# Checkout route
@app.route('/checkout', methods=['GET'])
def checkout():

  # Just hardcoding amounts here to avoid using a database
  item = request.args.get('item')
  title = None
  amount = None
  error = None

  if item == '1':
    title = 'The Art of Doing Science and Engineering'
    amount = 2300
  elif item == '2':
    title = 'The Making of Prince of Persia: Journals 1985-1993'
    amount = 2500
  elif item == '3':
    title = 'Working in Public: The Making and Maintenance of Open Source'
    amount = 2800
  else:
    # Included in layout view, feel free to assign error
    error = 'No item selected'
  
  payment_intent = stripe.PaymentIntent.create(
    amount=amount,
    currency="sgd",
    automatic_payment_methods={"enabled": True},
  )

  public_key = os.getenv('STRIPE_PUBLISHABLE_KEY')
  print("Stripe Public Key:", public_key)  # This is your publishable key

  return render_template('checkout.html', title=title, payment_intent_id=payment_intent.id, client_secret=payment_intent.client_secret, amount=payment_intent.amount, currency=payment_intent.currency, public_key=public_key, payment_status=payment_intent.status)

# Success route
@app.route('/success', methods=['GET'])
def success():
  payment_intent_id = request.args.get('payment_intent')  # This comes from confirmPayment in frontend
  payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)  # Retrieve the PaymentIntent
  
  amount_received = '{:.2f}'.format(payment_intent['amount_received'] / 100)  # Convert to dollars and format with 2 decimal places
  currency = payment_intent['currency']
  payment_status = payment_intent['status']
    
  return render_template('success.html', amount=amount_received, currency=currency, status=payment_status, payment_intent_id=payment_intent_id)



if __name__ == '__main__':
  app.run(port=5000, host='0.0.0.0', debug=True)