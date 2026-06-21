from dotenv import load_dotenv
import os
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")          # what's the variable name in your .env?

client = genai.Client(api_key=api_key)  # pass the key here

response = client.models.generate_content(
      model="gemini-2.5-flash",                     # which model are we using?
      contents="Say hello"
  )

print(response.text)                           # what part of response has the text?
