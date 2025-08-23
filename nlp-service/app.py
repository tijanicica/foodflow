from flask import Flask, request, jsonify
from transformers import pipeline
import logging

# Inicijalizacija Flask aplikacije
app = Flask(__name__)

# Podešavanje logovanja da bismo videli šta se dešava
logging.basicConfig(level=logging.INFO)

# Učitavanje Zero-Shot Classification modela
# Model se automatski preuzima i kešira pri prvom pokretanju!
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logging.info("NLP model successfully loaded.")
except Exception as e:
    logging.error(f"Failed to load NLP model: {e}")
    classifier = None


@app.route('/categorize', methods=['POST'])
def categorize_text():
    """
    Endpoint koji prima tekst i listu mogućih kategorija.
    Vraća najverovatniju kategoriju.
    """
    if not classifier:
        return jsonify({"error": "NLP model is not available."}), 500

    # Preuzimanje podataka iz JSON tela zahteva
    data = request.get_json()
    if not data or 'text' not in data or 'categories' not in data:
        return jsonify({"error": "Missing 'text' or 'categories' in request body."}), 400

    text_to_classify = data['text']
    candidate_labels = data['categories']

    # NLP magija se dešava ovde!
    logging.info(f"Categorizing text: '{text_to_classify}' with labels: {candidate_labels}")
    try:
        # Pozivamo model
        result = classifier(text_to_classify, candidate_labels)

        # Ekstrahujemo najverovatniju kategoriju i skor pouzdanosti
        best_category = result['labels'][0]
        confidence_score = result['scores'][0]

        logging.info(f"Result: Category='{best_category}', Score={confidence_score:.4f}")

        # Možete dodati prag pouzdanosti
        # Ako je skor prenizak, vratite "Other"
        if confidence_score < 0.30:  # Prag od 50%
            logging.info("Confidence score is below threshold. Falling back to 'Other'.")
            best_category = "Other"

        # Vraćamo rezultat kao JSON
        return jsonify({
            "category": best_category,
            "confidence": confidence_score
        })
    except Exception as e:
        logging.error(f"Error during classification: {e}")
        return jsonify({"error": "An error occurred during processing."}), 500


if __name__ == '__main__':
    # Pokrećemo server na portu 5000
    app.run(host='0.0.0.0', port=5000, debug=True)