# Survey App

A full-stack web application built with Next.js, Prisma, and PostgreSQL for creating and managing surveys with user authentication.

**Deployed Link:** [https://survey-austria.vercel.app/](https://survey-austria.vercel.app/)

**Developer:** Mark Joshua Austria

![Survey App](public/loader.svg)

## 📋 Features

- **User Authentication**
  - Sign up/Sign in functionality
  - JWT-based authentication
  - Secure password hashing with bcrypt

- **Survey Management**
  - Multiple question types:
    - Text input
    - Date selection
    - Radio buttons
    - Dropdowns/Select
    - Checkboxes
    - Currency input
  - Question validation
  - Real-time form feedback
  - Review submitted answers

- **Responsive UI**
  - Modern, clean interface
  - Tailwind CSS styling
  - Loading spinners and transitions
  - Form validation messages

## 🚀 Tech Stack

- **Frontend**:
  - [Next.js 15.5](https://nextjs.org/) (React 19.1)
  - [React Hook Form](https://react-hook-form.com/) for form management
  - [Zod](https://zod.dev/) for validation
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [shadcn/ui](https://ui.shadcn.com/) - Component library built on Radix UI

- **Backend**:
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
  - [Prisma ORM](https://www.prisma.io/) for database access
  - [PostgreSQL](https://www.postgresql.org/) database
  - [Neon](https://neon.tech/) - Serverless Postgres database
  - [JSON Web Tokens](https://jwt.io/) for authentication

## 📦 Project Structure

```
/
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── survey/         # Survey data endpoints
│   ├── auth/               # Authentication pages
│   └── survey/             # Survey pages
├── components/             # React components
│   ├── ui/                 # UI components
│   ├── LoadingSpinner.tsx  # Loading indicator
│   ├── SignOutButton.tsx   # Sign out functionality
│   └── SurveyReview.tsx    # Survey review component
├── lib/                    # Utility functions
│   ├── prisma.ts           # Prisma client instance
│   └── utils.ts            # Helper functions
├── prisma/                 # Prisma ORM
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 💾 Database Schema

The application uses the following data model:

- **Survey**: Contains survey information
- **Question**: Stores question details (type, options, etc.)
- **User**: User authentication data
- **Answer**: User responses to questions

## 🚦 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/surveydb"
SECRET_KEY="your-secret-key-for-jwt"
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/survey.git
   cd survey
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the database:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔄 Development Workflow

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with initial data

## 🧪 API Endpoints

- `POST /api/auth` - Authentication (sign-up, sign-in, sign-out)
- `GET /api/auth` - Check authentication status
- `POST /api/survey` - Submit survey answers
- `GET /api/survey` - Retrieve survey questions and answers

## 📱 Pages

- `/` - Root page (redirects to survey or auth)
- `/auth` - Authentication page (sign-up/sign-in)
- `/survey` - Survey form page

## 🔒 Authentication Flow

1. User signs up or signs in via the `/auth` page
2. Server validates credentials and issues a JWT token
3. Token is stored as an HTTP-only cookie
4. Protected routes verify the token
5. Sign out functionality clears the token

## 📊 Survey Flow

1. User logs in and is directed to the survey page
2. User completes the survey form
3. Responses are validated client-side using Zod
4. Validated responses are submitted to the server
5. Responses are stored in the database
6. User can review their responses

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components built with Shadcn UI and Tailwind CSS
- [Neon](https://neon.tech/) - Serverless Postgres database with a generous free tier
- [Vercel](https://vercel.com/) - Platform for deploying and hosting the application
