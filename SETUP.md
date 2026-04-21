# Himalayan Threads - Ecommerce Platform

A fully-functional, modern ecommerce website built with Next.js, React, Tailwind CSS, and Firebase. Designed for easy customization and reuse for different brands and product types.

## 🏔️ Features

### Core Functionality
- ✅ **Responsive Design** - Mobile-first approach, works perfectly on all devices
- ✅ **Dark/Light Mode** - Full theme support with persistent user preference
- ✅ **Product Filtering** - Filter by category, color, size, and price range
- ✅ **Shopping Cart** - Add/remove items, adjust quantities with persistent storage
- ✅ **Checkout** - Multi-step checkout process with shipping and payment
- ✅ **Authentication** - User registration, login, and profile management
- ✅ **Admin Panel** - Manage products, orders, and users (extensible)

### Design System
- **Color Scheme**: Himalayan mountain-inspired (gold, brown, earth tones)
- **Typography**: Modern, clean fonts with Tailwind CSS
- **Components**: Fully reusable, modular components
- **Animations**: Smooth transitions and hover effects
- **Icons**: Lucide React icons throughout

## 📁 Project Structure

```
ecommerce/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── products/
│   │   ├── page.tsx            # Products listing with filters
│   │   └── [id]/page.tsx       # Product detail page
│   ├── cart/page.tsx            # Shopping cart
│   ├── checkout/page.tsx        # Checkout process
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   └── profile/                 # User profile pages (extensible)
│
├── components/                   # Reusable React components
│   ├── ProductCard.tsx          # Product display card
│   ├── Navbar.tsx               # Navigation bar with mobile menu
│   ├── Footer.tsx               # Footer with newsletter
│   ├── ThemeToggle.tsx          # Dark/light mode switcher
│   ├── CategoryFilter.tsx       # Category filter component
│   ├── ColorFilter.tsx          # Color selector component
│   ├── PriceFilter.tsx          # Price range filter
│   └── SizeFilter.tsx           # Size selector component
│
├── lib/                          # Utilities and configurations
│   ├── data/
│   │   └── constants.ts         # Brand config, products, colors, sizes
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── ThemeContext.tsx     # Theme context (light/dark)
│   ├── store/
│   │   ├── useCartStore.ts      # Cart state management (Zustand)
│   │   └── useFilterStore.ts    # Product filter state (Zustand)
│   ├── firebase/
│   │   ├── client.ts            # Firebase client config
│   │   └── admin.ts             # Firebase admin config
│   └── utils.ts                 # Utility functions
│
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
└── README.md                      # This file
```

## 🎨 Customization Guide

### 1. Change Brand Colors & Information

Edit [lib/data/constants.ts](lib/data/constants.ts):

```typescript
export const BRAND_CONFIG = {
  name: "Your Brand Name",
  tagline: "Your tagline",
  description: "Your description",
  colors: {
    primary: "#YourColor",
    secondary: "#YourColor",
    // ...
  },
};
```

### 2. Update Product Data

Replace mock data in [lib/data/constants.ts](lib/data/constants.ts) with your actual products:

```typescript
export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Product Name",
    category: "category-name",
    price: 99.99,
    originalPrice: 129.99,
    image: "image-url",
    // ... other fields
  },
];
```

### 3. Customize Colors & Theme

Edit [tailwind.config.ts](tailwind.config.ts) to add your brand colors:

```typescript
colors: {
  mountain: {
    50: '#Your lighter shade',
    600: '#Your primary color',
    // ...
  },
}
```

### 4. Update Global Styles

Modify [app/globals.css](app/globals.css) to change global styling, animations, and component utilities.

### 5. Connect to Firebase

Update Firebase configuration in [lib/firebase/client.ts](lib/firebase/client.ts):

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  // ... other config
};
```

## 🔄 Modular Design Benefits

### Reusable Components
All components are built to be independent and reusable:

- **ProductCard** - Use anywhere to display products
- **Filters** - Mix and match filters in different pages
- **Navbar/Footer** - Can be used in multiple layouts

### Separate Data Management
- Product data is centralized in `constants.ts`
- Easy to switch between mock data and database queries
- Same component works with different data sources

### Theme System
- Light/dark mode automatically applied across all components
- Easy to change colors globally via Tailwind config
- Consistent styling everywhere

### Store Architecture
- **useCartStore** - Cart state independent of components
- **useFilterStore** - Filter state reusable across pages
- **useAuth** - Authentication state for any page

## 📦 Clone for Another Brand

To create a new brand website using this template:

1. **Copy the entire project**
   ```bash
   cp -r ecommerce new-brand-store
   ```

2. **Update configuration**
   - Edit `lib/data/constants.ts` with new brand name, colors, products
   - Update `tailwind.config.ts` with new color scheme
   - Modify `app/layout.tsx` title and description

3. **Update Firebase**
   - Create new Firebase project
   - Update configuration in `lib/firebase/client.ts`
   - Update database structure if needed

4. **Customize pages**
   - Update colors in components (they use Tailwind classes)
   - Modify newsletter signup (in Footer.tsx)
   - Update social media links

5. **Deploy**
   - Push to GitHub/GitLab
   - Deploy to Vercel or your hosting platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Firebase account

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials
- Email: `demo@example.com`
- Password: `password123`

## 📱 Pages Overview

| Page | Purpose | Features |
|------|---------|----------|
| `/` | Home Page | Hero, featured products, categories, newsletter |
| `/products` | Product List | Filtering, sorting, grid layout |
| `/products/[id]` | Product Detail | Gallery, description, reviews, colors/sizes |
| `/cart` | Shopping Cart | Item management, quantities, order summary |
| `/checkout` | Checkout | Multi-step form, shipping, payment |
| `/login` | Login | Email/password authentication |
| `/register` | Registration | Account creation with validation |

## 🔐 Authentication

- Firebase Authentication integrated
- User roles (admin/customer)
- Protected routes for checkout
- Auth context for app-wide access

## 🎯 Key Technologies

- **Framework**: Next.js 16.2
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Language**: TypeScript
- **Image Optimization**: Next.js Image

## 📖 Component Props

### ProductCard
```typescript
<ProductCard
  id="1"
  name="Product Name"
  price={99.99}
  originalPrice={129.99}
  image="image-url"
  rating={4.5}
  reviews={120}
  inStock={true}
  onAddToCart={(id) => {}}
/>
```

### Filter Components
All filter components automatically connect to `useFilterStore` and update the global filter state.

## 🎓 Best Practices

1. **Component Reusability** - Components don't depend on specific data
2. **Separation of Concerns** - UI, logic, and data are separated
3. **Mobile First** - All components designed for mobile first
4. **Accessibility** - Semantic HTML and ARIA labels included
5. **Performance** - Image optimization, code splitting, lazy loading
6. **Type Safety** - Full TypeScript support

## 🔧 Extending Features

### Add New Filter Type
1. Create new filter component in `components/`
2. Add state to `useFilterStore`
3. Add filter logic in product pages

### Add Payment Gateway
1. Install payment library (Stripe, PayPal)
2. Update checkout page
3. Integrate with Firebase

### Add Product Reviews
1. Create reviews component
2. Add Firestore collection for reviews
3. Display in product detail page

## 📞 Support

For questions or issues, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## 📄 License

This template is provided as-is for educational and commercial use.

---

**Built with ❤️ by the Himalayan Threads Team**

*Make ecommerce beautiful, reusable, and simple.*
