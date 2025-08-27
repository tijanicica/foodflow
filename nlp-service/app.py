from flask import Flask, request, jsonify
from transformers import pipeline
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

MODEL_PATH = "./final_model"

try:
    classifier = pipeline("text-classification", model=MODEL_PATH)
    logging.info("Fine-tuned NLP model successfully loaded from '%s'.", MODEL_PATH)
except Exception as e:
    logging.error(f"Failed to load fine-tuned model: {e}")
    classifier = None


@app.route('/categorize', methods=['POST'])
def categorize_text():

    if not classifier:
        return jsonify({"error": "NLP model is not available."}), 500

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' in request body."}), 400

    text_to_classify = data['text']

    logging.info(f"Categorizing text: '{text_to_classify}'")
    try:
        result = classifier(text_to_classify)

        best_result = result[0]
        best_category = best_result['label']
        confidence_score = best_result['score']

        logging.info(f"Result before threshold: Category='{best_category}', Score={confidence_score:.4f}")

        CONFIDENCE_THRESHOLD = 0.50

        if confidence_score < CONFIDENCE_THRESHOLD and best_category != "Other":
            logging.warning(f"Confidence score {confidence_score:.4f} is below threshold of {CONFIDENCE_THRESHOLD}. "
                            f"Overriding category '{best_category}' with 'Other'.")
            best_category = "Other"

        return jsonify({
            "category": best_category,
            "confidence": confidence_score
        })
    except Exception as e:
        logging.error(f"Error during classification: {e}")
        return jsonify({"error": "An error occurred during processing."}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)