# Cognitive Sanctuary

An AI-powered study companion designed for focused learning and curriculum management.

## Features

- **Authentication**: Secure login with email/password and Google Sign-In.
- **Dashboard**: Track pending tasks, completion rates, and a task calendar.
- **Curriculum Management**: Organize studies by Subject and Topic.
- **AI Study Assistant**: Interactive chat with markdown, LaTeX (KaTeX), and code syntax highlighting. The AI can create/edit notes based on provided context, generate summarized content, and create practice quizzes for specific topics.
- **Social & Chat**: Connect with friends via unique IDs, manage friend requests, and chat in real-time.
- **Note Editor**: Full-featured markdown editor with real-time preview.
- **Focus Space**: Dedicated environment for deep work sessions with a Pomodoro timer and calming sounds.
- **Cloud Storage**: Persistent data storage powered by Firebase Firestore. API keys are encrypted client-side before being securely stored.

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Firebase (Authentication, Firestore Database)
- **Styling**: Vanilla CSS (Custom design system)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: React-Markdown, Remark-GFM, Remark-Math, Rehype-Katex, Rehype-Raw
- **Date Handling**: date-fns
- **Security**: CryptoJS (Client-side AES encryption for API keys)

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

   Or try the [live demo](https://kr0issant.github.io/ai-study-companion/#/dashboard)

## Configuration

1. **Firebase Setup**:
   Create a Firebase project, enable Authentication (Email/Password, Google), and set up a Firestore Database. You may need to add your Firebase configuration via environment variables depending on the project setup.

2. **AI Provider**:
   Configure your AI provider (OpenAI/Gemini) in the **Settings** tab within the application to enable the AI Study Assistant. Your API keys are encrypted locally before being securely saved to Firebase.
