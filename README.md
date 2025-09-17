
# VisionBoard – Multi-Domain Goal Tracking System

## 📌 Overview
VisionBoard is a multi-domain goal tracking and progress monitoring system.  
It helps users set and track goals across areas like **health, career, finance, and education**, while integrating **AI-powered insights**:
- **Summarization & Recommendations (Gemini/OpenAI LLMs)**
- **Sentiment Analysis (HuggingFace models)**
- **Progress Forecasting (ARIMA/Prophet)**

This project is being developed as part of a **final year major project** following IEEE standards.

---

## 👥 Team Roles
- **Backend (Spring Boot + MySQL)** → REST APIs, Authentication, Goal Management, AI Integration.
- **Frontend (React.js + Tailwind)** → User Interface, Charts, Progress Visualization.
- **AI Services (Python)** → Summarization, Sentiment Analysis, Forecasting.

---

## 🔧 Tech Stack
### Frontend
- React.js  
- Tailwind CSS  
- Recharts / Chart.js  

### Backend
- Java Spring Boot  
- MySQL (Database)  
- JWT Authentication  

### AI Services
- Google Gemini / OpenAI GPT → Summarization  
- HuggingFace (RoBERTa, VADER) → Sentiment Analysis  
- ARIMA / Prophet → Forecasting  

### Hosting & Deployment
- Frontend → Netlify / Vercel  
- Backend → AWS / Render / Railway  
- Database → MySQL (local or cloud)  

---

## ⚙️ Features
- User Authentication (Register/Login with JWT)  
- Multi-Domain Goal Management (CRUD APIs)  
- Weighted Scoring & Streak Tracking  
- AI Summaries & Personalized Recommendations  
- Sentiment Feedback from progress  
- Progress Forecasting (time-series prediction)  
- Reminders & Notifications (Firebase – future scope)  

---

## 🚀 Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/<your-username>/visionboard.git
cd visionboard
