import requests
import json
import os
import base64
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("Missing GOOGLE_API_KEY in .env file.")

url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"

headers = {
    "Content-Type": "application/json"
}

data = {
    "input": {
        "text": "Hello, this is a quick test of Google Cloud Text-to-Speech API.\n"
                "I hope you are having a wonderful day.\n"
                "Let's convert this text into speech and listen to the result."
    },
    "voice": {
        "languageCode": "en-US",
        "name": "en-US-Wavenet-D",
        "ssmlGender": "FEMALE"
    },
    "audioConfig": {
        "audioEncoding": "MP3"
    }
}

# Make the POST request
response = requests.post(url, headers=headers, json=data)

# Check for successful response
if response.status_code == 200:
    audio_content = json.loads(response.content)["audioContent"]
    with open("output_api_key.mp3", "wb") as out:
        out.write(base64.b64decode(audio_content))
    print("✅ Audio content written to 'output_api_key.mp3'")
else:
    print(f"❌ Error {response.status_code}: {response.content}")
