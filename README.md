# SOC Copilot AI

SOC Copilot AI is a Security Operations Center (SOC) assistant designed to help security analysts analyze, triage, and respond to security events and logs using LLMs and advanced agentic workflows.

## Project Structure

```
soc-copilot-ai/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── prompts/
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│
├── data/
│   ├── sample_logs/
│   ├── processed/
│
├── docs/
│
├── figma/
│
├── README.md
│
├── .gitignore
│
└── .env
```

## Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env` to `backend/.env` (or configure root level `.env` as required) and configure env variables.
5. Run the application:
   ```bash
   python app.py
   ```
