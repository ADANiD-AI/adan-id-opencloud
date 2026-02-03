# Universal training script
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments
)
from datasets import load_dataset
import os

def train_islamic_model(
    base_model="models/islamic-ai-foundation",
    dataset_path="datasets/quranlab-islamic-dataset/train",
    output_dir="models/trained-islamic-ai"
):
    # Load model and tokenizer
    model = AutoModelForSequenceClassification.from_pretrained(base_model)
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    
    # Load dataset
    csv_files = [f for f in os.listdir(dataset_path) if f.endswith('.csv')]
    dataset = load_dataset("csv", data_files={f"train_{i}": os.path.join(dataset_path, f) for i, f in enumerate(csv_files)})
    
    # Tokenize
    def tokenize_function(examples):
        return tokenizer(examples["text"], truncation=True, padding=True)
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=8,
        num_train_epochs=3,
        save_strategy="epoch",
        evaluation_strategy="epoch"
    )
    
    # Train
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
    )
    
    trainer.train()
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    return output_dir

if __name__ == "__main__":
    trained_model = train_islamic_model()
    print(f"✅ Model trained and saved to: {trained_model}")
