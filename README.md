# Pantry - Smart Home Pantry Management

A modern SaaS application for managing your home pantry with AI-powered features, built with React, TypeScript, Supabase, and shadcn/ui.

## ✨ Features

- 🔐 **Authentication** - Secure user authentication with Supabase Auth (email + OAuth)
- 📦 **Pantry Management** - Add, edit, delete, and track pantry items
- 🗓️ **Expiry Tracking** - Monitor expiration dates and get alerts for expiring items
- 📸 **AI Photo Scanning** - Scan products with camera to auto-fill item details
- 🏷️ **Categories** - Organize items by categories with emoji indicators
- 📍 **Location Tracking** - Track where items are stored (Fridge, Freezer, etc.)
- ⚡ **Quick Adjust** - Fast quantity adjustments with +/- buttons
- 🛒 **Shopping List** - Automatically track low stock items
- 💎 **Subscription Tiers** - Free and Pro plans with Stripe integration
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## 🏗️ Architecture

This project follows a **clean service layer architecture**:

- **Services** - Business logic and API calls (single source of truth)
- **Hooks** - React Query hooks that use services
- **Components** - UI components that use hooks
- **Store** - Global state management with Zustand

📚 See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed documentation.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: Zustand + TanStack Query
- **Testing**: Vitest + Testing Library
- **Routing**: React Router v6
- **AI**: OpenAI API for image analysis
- **Payments**: Stripe
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── layout/        # Navigation, headers
│   ├── pantry/        # Pantry-specific components
│   └── ui/            # Reusable UI components (shadcn)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── pages/             # Page components
├── services/          # Business logic & API calls ⭐
│   ├── __tests__/     # Service unit tests
│   ├── pantry.service.ts
│   ├── auth.service.ts
│   └── subscription.service.ts
├── store/             # Zustand stores
├── test/              # Test utilities and setup
└── types/             # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) OpenAI API key for AI features

### Installation

1. **Clone and install dependencies:**

\`\`\`bash
npm install
\`\`\`

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env`:
\`\`\`
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
\`\`\`

3. **Set up Supabase database:**

Run these SQL commands in your Supabase SQL editor:

\`\`\`sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pantry_items table
CREATE TABLE pantry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  expiry_date DATE,
  purchase_date DATE,
  location TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for pantry_items
CREATE POLICY "Users can view own items" ON pantry_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON pantry_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON pantry_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON pantry_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

4. **Start the development server:**

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests** - Service layer and utilities
- **Integration Tests** - Full CRUD flows (requires test DB)
- **Component Tests** - UI component behavior

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for testing best practices.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

## 🏛️ Service Layer

The app uses a clean service layer architecture for all API calls:

```typescript
// ✅ Use services
import { pantryService } from '@/services'

const items = await pantryService.getItems(userId)
```

```typescript
// ❌ Don't call Supabase directly
const { data } = await supabase.from('pantry_items').select('*')
```

Available services:
- `pantryService` - Pantry CRUD operations
- `authService` - Authentication
- `subscriptionService` - Subscription management

## 🚀 Deployment to Vercel

1. **Push your code to GitHub**

2. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure environment variables:**
   Add the same variables from your `.env` file in Vercel's project settings

4. **Deploy!**
   Vercel will automatically deploy your app

## 📱 Mobile App (Coming Soon)

This project can be converted to a native iOS/Android app using **Capacitor**:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
npm run build
npx cap add ios
npx cap open ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed architecture documentation
- [Developer Guide](./docs/DEV_GUIDE.md) - Quick reference for developers
- [Session Configuration](./docs/SESSION_CONFIG.md) - Supabase session setup
- [Supabase Schema](./supabase/migrations/README.md) - Database schema and migrations

## 📄 License

This project is private and not licensed for public use.
│   │   ├── pantry/  # Pantry-specific components
│   │   └── ui/      # shadcn/ui components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and configs
│   ├── pages/       # Page components
│   ├── store/       # State management (Zustand)
│   ├── types/       # TypeScript types
│   ├── App.tsx      # Main app component
│   ├── main.tsx     # App entry point
│   └── index.css    # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
\`\`\`

## Future Enhancements

- 🤖 AI recipe suggestions based on available ingredients
- 📊 Analytics and insights on spending and waste
- 🛒 Shopping list generation
- 📷 Barcode scanning for quick item addition
- 🔔 Push notifications for expiring items
- 👥 Family sharing and collaborative pantry management
- 📱 Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.
