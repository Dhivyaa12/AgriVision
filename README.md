# AgriVision: AI-Powered Agricultural Assistant

AgriVision is a comprehensive web application designed to empower farmers by providing AI-driven insights and real-time data. From diagnosing crop diseases to recommending government schemes, AgriVision serves as a one-stop solution for modern agricultural needs. The platform is built with a multilingual interface to ensure accessibility for a diverse user base across India.

## Core Features

- **Crop Diagnosis**: Analyzes uploaded crop images and descriptions to identify diseases, suggest remedies, and provide preventive advice.
- **Crop Recommendation**: Recommends optimal crops based on soil type, weather conditions, and geographical location.
- **Market Watch**: Displays real-time Mandi (market) prices for various agricultural commodities, helping farmers make informed selling decisions.
- **Government Scheme Recommender**: Suggests relevant central and state government schemes tailored to the user's specific needs and location.
- **Multilingual Support**: Offers full-app translation and text-to-speech capabilities in English, Hindi, Tamil, Telugu, Kannada, and Malayalam.
- **Modern User Interface**: A responsive and accessible UI with light/dark theme support.

## Tech Stack

AgriVision is built on a modern, robust, and scalable technology stack:

- **Framework**: **Next.js 15** (with App Router) for server-side rendering and static site generation.
- **Language**: **TypeScript** for type safety and improved developer experience.
- **UI Library**: **React 18** for building interactive user interfaces.
- **Styling**: **Tailwind CSS** for utility-first styling, combined with **ShadCN UI** for a pre-built, accessible component library.
- **AI Integration**: **Genkit (v1.x)** serves as the backend framework to connect with and manage AI models.
- **Generative AI**: **Google Gemini API** (including `gemini-2.0-flash` for analysis/translation and `gemini-2.5-flash-preview-tts` for text-to-speech).
- **Forms**: **React Hook Form** with **Zod** for robust form validation.
- **State Management**: **React Context API** and custom hooks (`useLanguage`, `useTranslation`) for managing global state like language and theme.

## Project Structure

The project follows a standard Next.js App Router structure:

```
src
├── ai                  # Genkit AI flows and configuration
│   ├── flows           # Contains all AI-powered logic (e.g., diagnosis, recommendation)
│   └── genkit.ts       # Genkit global configuration
├── app                 # Application routes and pages
│   ├── (page-name)     # Each feature has its own route directory
│   │   └── page.tsx
│   ├── globals.css     # Global styles and ShadCN theme variables
│   └── layout.tsx      # Root layout for the entire application
├── components          # Reusable React components
│   ├── forms           # Form components for each feature
│   └── ui              # ShadCN UI components
├── hooks               # Custom React hooks (e.g., useTranslation, useLanguage)
└── lib                 # Utility functions
```

## Workflow Example: Crop Diagnosis

Here’s a step-by-step breakdown of how a feature works, using Crop Diagnosis as an example:

1.  **User Interaction (Frontend)**:
    - A user navigates to the `/crop-diagnosis` page.
    - The `CropDiagnosisForm` component (`src/components/forms/crop-diagnosis-form.tsx`) renders the UI.
    - The user uploads an image and provides a text description (or uses the microphone for speech-to-text).

2.  **API Request**:
    - Upon form submission, the frontend calls the `diagnoseCrop` function, which is a server-side function exported from the AI flow.
    - The image is converted to a Base64 data URI and sent along with the description to the backend.

3.  **AI Processing (Backend)**:
    - The `diagnoseCropFlow` in `src/ai/flows/crop-diagnosis.ts` is triggered.
    - It uses a structured prompt to send the image and text to the **Gemini 2.0 Flash** model.
    - The prompt instructs the model to return a JSON object containing the disease name, causes, remedies, and preventive measures.

4.  **Response Handling (Frontend)**:
    - The structured JSON response is received by the `CropDiagnosisForm` component.
    - The component updates its state, and the diagnosis results are displayed in a user-friendly format.

5.  **Text-to-Speech (Optional)**:
    - If the user clicks the "Listen" button, the `textToSpeech` flow is called with the diagnosis text and selected language.
    - The text is first translated via the `translateText` flow if the language is not English.
    - The (translated) text is sent to the **Gemini TTS model**, which generates the audio.
    - The audio is returned to the frontend as a data URI and played automatically.

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    - Create a `.env` file in the root directory.
    - Add your Gemini API key:
      ```
      GEMINI_API_KEY=your_api_key_here
      ```

4.  **Run the development server**:
    The application runs on two parallel processes: the Next.js frontend and the Genkit AI server.
    
    - **Run the Next.js app**:
      ```bash
      npm run dev
      ```
    - **Run the Genkit server**:
      ```bash
      npm run genkit:dev
      ```

5.  **Open the application**:
    Navigate to `http://localhost:9002` in your browser.
```