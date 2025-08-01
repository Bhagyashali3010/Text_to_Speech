from fastapi import FastAPI, File, UploadFile, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import speech
from google.cloud import storage
import base64
import os
import uuid
from pydub import AudioSegment
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()
gemini_api_key = os.environ.get("GEMINI_API_KEY")
# ...existing code...

# Allow CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Example Gemini translation endpoint
import google.generativeai as genai
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash-lite")

@app.post("/translate")
async def translate(request: Request):
    hindi_text = await request.body()
    hindi_text = hindi_text.decode("utf-8")

    prompt = f"""Translate the following Hindi text line by line to English. 
Return only translations with each Hindi line followed directly by its English translation, 
with one empty line between each pair. Do not add any explanation or preamble. Here is the text:

{hindi_text}
"""

    response = model.generate_content(prompt)
    clean_output = response.text.strip()

    # Optional: Remove Gemini's common starting explanation if it still appears
    unwanted_intro = "Okay, I will provide a line-by-line translation"
    if unwanted_intro in clean_output:
        clean_output = clean_output.split("\n", 1)[1].strip()

    return {"english": clean_output}

@app.post("/translate-only-english")
async def translate_only_english(request: Request):
    hindi_text = await request.body()
    hindi_text = hindi_text.decode("utf-8")

    prompt = f"""Translate the following Hindi text to English only. 
Provide only the English translation without showing the original Hindi text.
Here is the Hindi text:

{hindi_text}
"""

    response = model.generate_content(prompt)
    clean_output = response.text.strip()

    # Optional cleanup
    unwanted_intro = "Sure, here is the translation"
    if unwanted_intro in clean_output:
        clean_output = clean_output.split("\n", 1)[1].strip()

    return {"english_only": clean_output}



os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "tgf-text-to-speech-645150b5f66b.json"
speech_client = speech.SpeechClient()
storage_client = storage.Client()

GCS_BUCKET = "tgf-audio-bucket"  # <-- CHANGE THIS TO YOUR BUCKET NAME

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    content = await audio.read()
    content_b64 = base64.b64encode(content).decode("utf-8")
    audio_dict = {"content": content_b64}
    config = {
        "language_code": "hi-IN",  # or "en-US"
        "encoding": "MP3"
        # "sample_rate_hertz": 16000,  # Uncomment and set if you know the sample rate
    }
    try:
        response = speech_client.recognize(config=config, audio=audio_dict)
        transcription = " ".join([res.alternatives[0].transcript for res in response.results])
        return {"text": transcription}
    except Exception as e:
        return {"error": str(e)}

@app.post("/transcribe-long")
async def transcribe_long_audio(audio: UploadFile = File(...), language_code: str = Form("hi-IN")):
    temp_filename = f"temp-{uuid.uuid4()}-{audio.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await audio.read())

    file_ext = audio.filename.lower().split('.')[-1]
    if file_ext in ["mp3", "mpeg"]:
        sound = AudioSegment.from_file(temp_filename, format="mp3")
        encoding = speech.RecognitionConfig.AudioEncoding.MP3
        sample_rate = sound.frame_rate
    else:
        sound = AudioSegment.from_file(temp_filename, format="wav")
        encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        sample_rate = sound.frame_rate

    chunk_length_ms = 60 * 1000  # 60 seconds
    chunks = [sound[i:i+chunk_length_ms] for i in range(0, len(sound), chunk_length_ms)]
    transcription = ""

    for idx, chunk in enumerate(chunks):
        chunk_filename = f"chunk_{idx}_{temp_filename}"
        chunk.export(chunk_filename, format=file_ext)
        # Upload chunk to GCS
        bucket = storage_client.bucket(GCS_BUCKET)
        blob = bucket.blob(chunk_filename)
        blob.upload_from_filename(chunk_filename)
        gcs_uri = f"gs://{GCS_BUCKET}/{chunk_filename}"
        audio_gcs = speech.RecognitionAudio(uri=gcs_uri)
        config = speech.RecognitionConfig(
            encoding=encoding,
            language_code=language_code,
            sample_rate_hertz=sample_rate,
            enable_automatic_punctuation=True
        )
        try:
            operation = speech_client.long_running_recognize(config=config, audio=audio_gcs)
            response = operation.result(timeout=600)
            transcription += " ".join([res.alternatives[0].transcript for res in response.results]) + " "
        except Exception as e:
            transcription += f"[Chunk {idx} error: {str(e)}] "
        # Clean up chunk file and GCS blob
        os.remove(chunk_filename)
        blob.delete()

    os.remove(temp_filename)
    return {"text": transcription.strip()}


@app.post("/translate-to-language")
async def translate_to_language(payload: dict = Body(...)):
    english_text = payload.get("english_text", "")
    target_language = payload.get("target_language", "Spanish")

    prompt = f"""Translate the following English text to {target_language}. 
Return only the translated output without explanation. Do not show the original English text.

Here is the text:
{english_text}
"""

    response = model.generate_content(prompt)
    clean_translation = response.text.strip()

    return {"translated_text": clean_translation}
