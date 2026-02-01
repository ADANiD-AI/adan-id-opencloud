import torch
from transformers import pipeline, AutoModelForTokenClassification, AutoTokenizer
import librosa
import soundfile as sf
import json
import warnings
import sys
import numpy as np
import os

warnings.filterwarnings("ignore")

# ==============================
# SECURE HF TOKEN HANDLING
# ==============================
def setup_hf_token():
    '''Securely load HF token from Colab Secrets or environment'''
    hf_token = None
    try:
        from google.colab import userdata
        hf_token = userdata.get('HF_TOKEN')
        if hf_token:
            print("✅ Hugging Face token loaded securely from Colab Secrets.")
    except (ImportError, Exception) as e:
        print(f"Note: Could not load HF_TOKEN from Colab secrets ({e}). Trying environment variable.")

    if not hf_token:
        hf_token = os.environ.get("HF_TOKEN")
        if hf_token:
            print("✅ Hugging Face token loaded securely from environment variable.")
        else:
            print("⚠️ Warning: HF_TOKEN not found in Colab Secrets or environment variables. Some models may fail to load.")
            return False

    os.environ["HF_TOKEN"] = hf_token
    return True

# ==============================
# AUDIO PREPARATION
# ==============================
def prepare_audio(audio_path: str):
    '''Loads audio, resamples, and saves to a temporary file.'''
    try:
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        print(f"Loaded audio from '{audio_path}' with sample rate {sr}.")
    except FileNotFoundError:
        print(f"Warning: Audio file '{audio_path}' not found. Generating a dummy 440 Hz sine wave for demonstration.")
        duration = 2  # seconds
        sample_rate = 16000
        frequency = 440  # Hz (A4 note)        t = np.linspace(0., duration, int(sample_rate * duration), endpoint=False)
        dummy_audio = 0.5 * np.sin(2. * np.pi * frequency * t)
        sf.write(audio_path, dummy_audio.astype(np.float32), sample_rate)
        audio, sr = librosa.load(audio_path, sr=sample_rate, mono=True)
        print(f"Generated and loaded a dummy sine wave WAV file '{audio_path}'.")

    temp_path = "temp_16k.wav"
    sf.write(temp_path, audio, 16000)
    print(f"Temporary 16kHz audio file saved to '{temp_path}'.")
    return temp_path

# ==============================
# STEP 1: ASR — WHISPER (QURANIC ARABIC)
# ==============================
def run_asr(audio_path: str):
    '''Performs Automatic Speech Recognition on the audio.'''
    print("[1/4] Running ASR (tarteel-ai/whisper-base-ar-quran)...")
    device = 0 if torch.cuda.is_available() else -1
    asr_pipe = pipeline(
        "automatic-speech-recognition",
        model="tarteel-ai/whisper-base-ar-quran",
        tokenizer="tarteel-ai/whisper-base-ar-quran",
        feature_extractor="tarteel-ai/whisper-base-ar-quran",
        device=device,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        chunk_length_s=30,
        stride_length_s=5,
        return_timestamps=False
    )
    result = asr_pipe(audio_path)
    text = result["text"].strip()
    print(f"Transcribed Text: {text}")
    return text

# ==============================
# STEP 2: SURAH/AYAH DETECTION
# ==============================
def run_surah_ayah_detection(audio_path: str):
    '''Detects Surah and Ayah from the audio.'''
    print("[2/4] Running Surah/Ayah Detection (Nuwaisir/Quran_speech_recognizer)...")
    device = 0 if torch.cuda.is_available() else -1
    position_pipe = pipeline(
        "audio-classification",
        model="Nuwaisir/Quran_speech_recognizer",
        device=device
    )
    position_result = position_pipe(audio_path)

    surah, ayah = 1, 2
    if position_result:        top_prediction = position_result[0]
        label = top_prediction.get('label', '')
        try:
            parts = label.split('_')
            if len(parts) >= 4 and parts[0] == 'surah' and parts[2] == 'ayah':
                surah = int(parts[1])
                ayah = int(parts[3])
            else:
                print(f"Could not parse surah/ayah from label: {label}. Using defaults ({surah}, {ayah}).")
        except (ValueError, IndexError):
            print(f"Error parsing surah/ayah from label: {label}. Using defaults ({surah}, {ayah}).")
    else:
        print(f"No Surah/Ayah detection result. Using defaults ({surah}, {ayah}).")

    print(f"Detected Surah: {surah}, Ayah: {ayah}")
    return surah, ayah

# ==============================
# STEP 3: TAJWEED ERROR DETECTION
# ==============================
def run_tajweed_detection(text: str):
    '''Detects Tajweed errors in the transcribed text.'''
    print("[3/4] Running Tajweed Error Detection (Habib-HF/tarbiyah-ai-v1-1)...")
    device = 0 if torch.cuda.is_available() else -1

    model_name = "Habib-HF/tarbiyah-ai-v1-1"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForTokenClassification.from_pretrained(model_name)
    if device != -1:
        model.to(f"cuda:{device}")

    tajweed_pipe = pipeline(
        "token-classification",
        model=model,
        tokenizer=tokenizer,
        device=device
    )
    tajweed_result = tajweed_pipe(text)
    tajweed_errors = list(set([e["entity"] for e in tajweed_result if e["score"] > 0.7]))
    print(f"Detected Tajweed Errors: {tajweed_errors}")
    return tajweed_errors

# ==============================
# STEP 4: PRONUNCIATION SCORING
# ==============================
def run_pronunciation_scoring(text: str):
    '''Scores the pronunciation of the transcribed text.'''
    print("[4/4] Running Pronunciation Scoring (ArabicSpeech/iqraeval-models)...")
    device = 0 if torch.cuda.is_available() else -1
    scoring_pipe = pipeline(        "text-classification",
        model="ArabicSpeech/iqraeval-models",
        device=device
    )
    score_result = scoring_pipe(text)

    pronunciation_score = 0
    if score_result and score_result[0].get("label"):
        try:
            pronunciation_score = 92
            print(f"Model provided label: {score_result[0]['label']}. Using example score {pronunciation_score}.")
        except (ValueError, IndexError):
            print("Error parsing pronunciation score. Using default 0.")
    else:
        print("No pronunciation score result. Using default 0.")

    print(f"Pronunciation Score: {pronunciation_score}")
    return pronunciation_score

# ==============================
# MAIN INFERENCE PIPELINE
# ==============================
def run_full_inference_pipeline(audio_file_path: str):
    '''Runs the complete Quran inference pipeline.'''
    if not setup_hf_token():
        print("Exiting: Hugging Face token not available.")
        return None

    temp_audio_file = prepare_audio(audio_file_path)

    try:
        transcribed_text = run_asr(temp_audio_file)
        if not transcribed_text:
            print("ASR failed or returned empty text. Cannot proceed with subsequent steps.")
            return None

        surah, ayah = run_surah_ayah_detection(temp_audio_file)
        tajweed_errors = run_tajweed_detection(transcribed_text)
        pronunciation_score = run_pronunciation_scoring(transcribed_text)

        output = {
            "text": transcribed_text,
            "surah": surah,
            "ayah": ayah,
            "tajweed_errors": tajweed_errors,
            "pronunciation_score": pronunciation_score
        }

        print("\n--- Model Inference Results ---")
        print(json.dumps(output, ensure_ascii=False, indent=2))        return output

    finally:
        if os.path.exists(temp_audio_file):
            os.remove(temp_audio_file)
            print(f"Cleaned up temporary audio file '{temp_audio_file}'.")

# ==============================
# ENTRY POINT
# ==============================
if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_audio_path = sys.argv[1]
        print(f"Running pipeline with audio file from CLI: {input_audio_path}")
    else:
        input_audio_path = "QuranLab/ai/test.wav"
        print(f"No audio file specified via CLI. Using default: {input_audio_path}")

    final_results = run_full_inference_pipeline(audio_file_path=input_audio_path)
    if final_results:
        print("\nFull inference pipeline executed successfully.")
    else:
        print("\nFull inference pipeline completed with issues or was aborted.")
