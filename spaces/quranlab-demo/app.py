import gradio as gr
import os
import sys
sys.path.append("../projects/quranlab/ai")
from quran_inference_pipeline import run_full_inference_pipeline

def analyze_recitation(audio_file):
    result = run_full_inference_pipeline(audio_file)
    if result:
        return (
            result["text"],
            f"Surah {result['surah']}, Ayah {result['ayah']}",
            ", ".join(result["tajweed_errors"]),
            f"{result['pronunciation_score']}/100"
        )
    else:
        return ("Error", "N/A", "N/A", "N/A")

demo = gr.Interface(
    fn=analyze_recitation,
    inputs=gr.Audio(type="filepath"),
    outputs=[
        gr.Textbox(label="Transcribed Text"),
        gr.Textbox(label="Position"),
        gr.Textbox(label="Tajweed Errors"),
        gr.Textbox(label="Pronunciation Score")
    ],
    title="🌙 QuranLab AI",
    description="Part of ADANiD Ecosystem"
)

if __name__ == "__main__":
    demo.launch()
