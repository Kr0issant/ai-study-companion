# Cognitive Sanctuary

An AI-powered study companion designed for focused learning and curriculum management.

## Features

- **Dashboard**: Track pending tasks, completion rates, and a task calendar.
- **Curriculum Management**: Organize studies by Subject and Topic.
- **AI Study Assistant**: Interactive chat with markdown, LaTeX (KaTeX), and code syntax highlighting. The AI can create/edit notes based on provided context, generate summarized content, and create practice quizzes for specific topics.
- **Note Editor**: Full-featured markdown editor with real-time preview.
- **Focus Space**: Dedicated environment for deep work sessions with a Pomodoro timer and calming sounds.
- **Persistent Storage**: All data is saved locally via `localStorage`.

## Tech Stack

- **Frontend**: React, Vite
- **Styling**: Vanilla CSS (Custom design system)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: React-Markdown, Remark-GFM, Remark-Math, Rehype-Katex, Rehype-Raw
- **Date Handling**: date-fns

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

## Configuration

Configure your AI provider (OpenAI/Gemini) in the **Settings** tab within the application to enable the AI Study Assistant.