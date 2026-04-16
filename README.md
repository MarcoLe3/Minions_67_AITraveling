# AI Travel Itinerary Planner 🌍✈️ - CSC 603 [01] Gen AI 
- Team 6
- Marco Lee (Team Lead)
- Ahmed Mriziq
- Ben Nguyen

For our capstone, we devleoped an AI-powered travel planning application that generates personalized itineraries based on user preferences. By leveraging FastAPI and Next.js, it provides a seamless experience for users to plan their next adventure.

## 🚀 Key Features

- **AI-Generated Itineraries**: Uses Hugging Face's language models to create detailed travel plans.
- **Smart Parsing**: Automatically extracts daily activities, costs, and summaries into a structured format.
- **Responsive Web Interface**: A modern frontend built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Integration**: [Hugging Face Inference API](https://huggingface.co/inference-api)
- - Hugging Face Model Used: (https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
  - Prev: (https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)
    
- **Data Validation**: [Pydantic](https://docs.pydantic.dev/)

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

---

## 🏗️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Hugging Face API Key](https://huggingface.co/settings/tokens)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory and add your Hugging Face API key:
   ```env
   HF_API_KEY=your_huggingface_api_key_here
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd my-next-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 🚦 Usage
1. Enter your **Origin** and **Destination**.
2. Specify your **Budget** and the number of **Days** for your trip.
3. Click **Generate** to get your AI-powered itinerary!

## 🧪 API Documentation
Once the backend is running, you can explore the interactive API docs at:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
