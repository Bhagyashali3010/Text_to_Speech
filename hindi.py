import requests
import os
import base64
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# # Read Hindi text file (make sure it's UTF-8 encoded)
# with open("hindi_text.txt", "r", encoding="utf-8") as file:
#     text_content = file.read()

url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"

headers = {
    "Content-Type": "application/json"
}

data = {
    "input": {
        "text": "नमस्ते, आज का मौसम बहुत अच्छा है।\n"
                "मैं Google Text to Speech API का उपयोग कर रहा हूँ।"
    },
    "voice": {
        "languageCode": "hi-IN",
        "name": "hi-IN-Standard-A"
    },
    "audioConfig": {
        "audioEncoding": "MP3"
    }
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    audio_content = response.json()["audioContent"]
    with open("output_hindi.mp3", "wb") as out:
        out.write(base64.b64decode(audio_content))
    print("✅ Hindi audio saved as 'output_hindi.mp3'")
else:
    print(f"❌ Error {response.status_code}: {response.content}")
