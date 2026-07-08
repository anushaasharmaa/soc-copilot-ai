import os
from dotenv import load_dotenv

# Load root-level or local .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    # AI Config
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # App Settings
    DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")

config = Config()
