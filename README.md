# Xplore 🚀

**Xplore** is an AI-powered application designed to help users discover and build personalized career roadmaps. By leveraging the power of Google's **Gemini AI**, Xplore generates step-by-step learning paths tailored to specific job roles, helping users navigate their professional journey with confidence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28)

## ✨ Features

- **🤖 AI-Powered Roadmaps**: Generate detailed, step-by-step career paths for any job role using Google's Gemini 1.5 Flash model.
- **🔐 Secure Authentication**: Seamless sign-in with Google via Firebase Authentication.
- **☁️ Cloud Persistence**: Save your favorite roadmaps to the cloud using Cloud Firestore.
- **🌓 Dark Mode**: Fully responsive UI with automatic and manual dark/light mode switching.
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **⚡ Fast Performance**: Built on Next.js 16 for server-side rendering and static generation benefits.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI Model**: [Google Gemini 1.5 Flash](https://ai.google.dev/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or later) installed.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/xplore.git
    cd xplore
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your API keys.
    *(Note: The current codebase might use `src/lib/firebase.js`. It is recommended to move these to environment variables for production)*

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

    You will also need a Google Gemini API Key:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
xplore/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utility functions and configurations (Firebase)
│   └── ...
├── public/               # Static assets
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
