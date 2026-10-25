# E-Commerce Website with Next.js, MongoDB & Stripe

An e-commerce platform built with Next.js, MongoDB for data storage, and Stripe for secure payment processing. Users can browse products, add items to cart, and complete purchases with automatic user account creation at checkout.

## 🚀 Features

- **No Authentication Required**: Session-based cart system using localStorage
- **Automatic User Creation**: User accounts created during Stripe checkout
- **Secure Payments**: Stripe integration with webhook support
- **MongoDB Storage**: Cart items, users, and orders stored in MongoDB
- **Responsive Design**: Built with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Stripe account (test mode works fine)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tMust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   ```

4. **Set up Stripe Webhook**
   
   For local development, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   
   For production, add webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhook`
   - Event: `checkout.session.completed`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

### Cart System
- Unique session ID generated per browser
- Stored in localStorage
- Cart persists across page reloads
- No sign-in required

### Checkout Process
1. User adds products to cart
2. Clicks "Proceed to Checkout"
3. Redirected to Stripe Checkout page
4. Stripe collects: email, name, phone, addresses
5. After payment success:
   - Webhook triggers user creation
   - User data saved to MongoDB
   - Order recorded
   - Cart automatically cleared

### Database Collections

- **cart**: Temporary cart items with session IDs
- **users**: Customer information (created at checkout)
- **orders**: Order history and details

## 🧪 Testing

Use Stripe test card for testing:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 📝 Recent Migration

This project was recently migrated from:
- ❌ Clerk Authentication → ✅ Session-based cart
- ❌ PostgreSQL/Drizzle → ✅ MongoDB
- ❌ Pre-checkout user creation → ✅ Checkout-time user creation

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration notes.

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Database**: MongoDB
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)

## 🚀 Deploy on Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Update Stripe webhook URL to production domain
5. Deploy!

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
