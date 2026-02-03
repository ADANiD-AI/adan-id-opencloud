import gradio as gr
from transformers import pipeline

classifier = pipeline("text-classification", model="ADANiD/Quranlab-AI")

def classify_text(text):
    if not text.strip():
        return "Please enter text"
    result = classifier(text)
    return f"**{result[0]['label']}** (Confidence: {result[0]['score']:.2f})"

demo = gr.Interface(
    fn=classify_text,
    inputs=gr.Textbox(lines=5, placeholder="Enter Islamic text..."),
    outputs="text",
    title="🌙 Quranlab-AI Demo",
    description="Classify Quran, Hadith, and Fiqh texts"
)

demo.launch()
