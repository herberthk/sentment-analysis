# Sentilens - Customer Sentiment Dashboard

Sentilens is a powerful, AI-driven dashboard designed to transform raw customer feedback into actionable business strategies. By leveraging **Google's Gemini 2.5 Flash** model with advanced reasoning capabilities, Sentilens analyzes unstructured reviews to provide deep insights, sentiment trends, and prioritized recommendations.

![Sentilens Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000)

## 🚀 Features

- **Deep Sentiment Analysis**: Automatically scores reviews on a scale of 0-100 (Negative to Positive) and calculates an overall sentiment health score.
- **Intelligent Insights**:
  - **Actionable Items**: Identifies and prioritizes critical areas for improvement (High/Medium/Low).
  - **Word Cloud**: Visualizes frequently used terms, categorized by sentiment (Positive, Negative, Neutral).
- **Interactive Data Visualization**:
  - Dynamic charts showing sentiment trends over time.
  - Interactive word clouds.
- **AI Chat Assistant**: a built-in "Talk to Data" feature that allows you to ask specific questions about the analyzed feedback (e.g., "What do customers say about shipping?").
- **Modern & Responsive UI**: Built with React 19 and Tailwind CSS for a seamless user experience.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini 2.5 Flash)
- **Visualization**: [Recharts](https://recharts.org/) & [D3.js](https://d3js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm, yarn, or bun

You will also need a **Google Gemini API Key**. You can obtain one from [Google AI Studio](https://aistudio.google.com/).

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/sentilens.git
   cd sentilens
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🚀 Usage

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open the application**
   Navigate to `http://localhost:5173` in your browser.

3. **Analyze Reviews**

   - Paste a collection of customer reviews (raw text) into the input field.
   - Click **Analyze**.
   - View the dashboard populated with sentiment scores, charts, and actionable insights.

4. **Chat with your Data**
   - Use the chat widget in the bottom right corner to ask questions about the analysis results.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
