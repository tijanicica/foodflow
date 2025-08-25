import pandas as pd
from datasets import Dataset
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from sklearn.metrics import accuracy_score, f1_score


def train():

    print("Loading and preparing data...")
    df = pd.read_csv("tickets_dataset.csv")

    labels = df['label'].unique().tolist()
    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for i, label in enumerate(labels)}

    print(f"Found {len(labels)} categories: {labels}")

    df['label'] = df['label'].map(label2id)

    train_df, eval_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['label'])

    print(f"Training samples: {len(train_df)}")
    print(f"Evaluation samples: {len(eval_df)}")

    train_dataset = Dataset.from_pandas(train_df)
    eval_dataset = Dataset.from_pandas(eval_df)

    model_checkpoint = "distilbert-base-uncased"
    print(f"Loading tokenizer and model for '{model_checkpoint}'...")

    tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_checkpoint,
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id
    )

    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True)

    print("Tokenizing datasets...")
    tokenized_train_dataset = train_dataset.map(tokenize_function, batched=True)
    tokenized_eval_dataset = eval_dataset.map(tokenize_function, batched=True)

    def compute_metrics(p):
        preds = np.argmax(p.predictions, axis=1)
        labels = p.label_ids
        f1 = f1_score(labels, preds, average="weighted")
        acc = accuracy_score(labels, preds)
        return {"accuracy": acc, "f1": f1}

    output_dir = "./foodflow_ticket_classifier"


    total_steps = len(tokenized_train_dataset) // 8 * 5  # batch_size * epochs
    eval_save_steps = len(tokenized_train_dataset) // 8  # Once per epoch

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
        save_steps=eval_save_steps,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train_dataset,
        eval_dataset=tokenized_eval_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    print("Starting training...")
    trainer.train()

    print("Evaluating final model...")
    eval_result = trainer.evaluate()
    print(f"Final evaluation results: {eval_result}")

    final_model_path = "./final_model"
    print(f"Training finished. Saving best model to '{final_model_path}'")
    trainer.save_model(final_model_path)
    tokenizer.save_pretrained(final_model_path)

    import json
    with open(f"{final_model_path}/label_mappings.json", "w") as f:
        json.dump({"label2id": label2id, "id2label": id2label}, f)

    print("Done! Model, tokenizer, and label mappings saved.")


if __name__ == "__main__":
    train()