# AgriVision: AI-Powered Agricultural Assistant

AgriVision is a comprehensive web application designed to empower farmers by providing AI-driven insights and real-time data. From diagnosing crop diseases to recommending government schemes, AgriVision serves as a one-stop solution for modern agricultural needs. The platform is built with a multilingual interface to ensure accessibility for a diverse user base across India.

Youtube Link:- https://youtu.be/hkvd_iaR5CU

Website Link:- http://agri-pi-gilt.vercel.app

API MarketWatch data:- https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
<!-- Add a screenshot of the dashboard here -->

## Core Features

- **Crop Diagnosis**: Analyzes uploaded crop images and descriptions to identify diseases, suggest remedies, and provide preventive advice.
- **Crop Recommendation**: Recommends optimal crops based on soil type, weather conditions, and geographical location.
- **Market Watch**: Displays real-time Mandi (market) prices for various agricultural commodities, helping farmers make informed selling decisions.
- **Market Analyser**: Predicts future commodity prices using historical data and AI-powered trend analysis.
- **Sensor Analysis**: Integrates and analyzes farm sensor data to provide a holistic view of soil health and environmental conditions, coupled with crop and scheme recommendations.
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

## Local Development Setup

To get AgriVision running on your local machine, follow these steps.

### 1. Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 2. Clone the Repository

```bash
git clone https://github.com/Dhivyaa12/AgriVision.git
cd AgriVision
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory of your project and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### 5. Run the Development Servers

For local development, the application requires two separate processes to run concurrently: the Next.js frontend and the Genkit AI server.

- **Terminal 1: Run the Next.js App**
  This command starts the frontend development server.

  ```bash
  npm run dev
  ```
  The app will be available at `http://localhost:9002`.

- **Terminal 2: Run the Genkit Server**
  This command starts the Genkit server, which powers all the AI features.

  ```bash
  npm run genkit:dev
  ```

Once both servers are running, you can access the application in your browser.

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
└── lib                 # Utility functions and static data
```

<!-- Add a screenshot of the Crop Diagnosis feature here -->

## How It Works: An Example Workflow

Here’s a step-by-step breakdown of how a feature works, using **Crop Diagnosis** as an example:

1.  **User Interaction (Frontend)**:
    - A user navigates to the `/crop-diagnosis` page.
    - The `CropDiagnosisForm` component (`src/components/forms/crop-diagnosis-form.tsx`) renders the UI.
    - The user uploads an image and provides a text description (or uses the microphone for speech-to-text).

2.  **API Request**:
    - Upon form submission, the frontend calls the `diagnoseCrop` server function.
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
```
