import requests
import json

# --- Configuration ---
NLP_API_URL = "http://127.0.0.1:5000/categorize"
CANDIDATE_LABELS = [
    "Incomplete order",
    "Wrong order",
    "Damaged food/packaging",
    "Cold/spoiled food",
    "Undeclared allergens",
    "Undeclared diet type",
    "Delivery delay",
    "Order not delivered",
    "Problem with the delivery person",
    "Website problem",
    "Other"
]


# --- ANSI Color Codes for Terminal Output ---
class bcolors:
    HEADER = '\033[95m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


# --- Test Cases ---
# Each item is a dictionary with 'text' and 'expected_category'
TEST_CASES = [
    # Delivery problems
    {"text": "My pizza has been late for over an hour, what is the status?", "expected_category": "Delivery delay"},
    {"text": "The app says delivered, but I never received my food.", "expected_category": "Order not delivered"},
    {"text": "The driver was rude and just left the food on the ground.",
     "expected_category": "Problem with the delivery person"},
    {"text": "Where is my order? It should have arrived 30 minutes ago.", "expected_category": "Delivery delay"},

    # Order problems
    {"text": "I ordered a combo meal but the drink was missing.", "expected_category": "Incomplete order"},
    {"text": "This isn't what I paid for. I got a salad instead of a burger.", "expected_category": "Wrong order"},
    {"text": "The box was crushed and the soup spilled everywhere.", "expected_category": "Damaged food/packaging"},
    {"text": "The food arrived completely cold, it's inedible.", "expected_category": "Cold/spoiled food"},
    {"text": "There are nuts in this dish and the menu didn't say so! I'm allergic.",
     "expected_category": "Undeclared allergens"},
    {"text": "I ordered a vegan pizza and I think this has real cheese.", "expected_category": "Undeclared diet type"},

    # Technical problems
    {"text": "My credit card payment failed but I was still charged. The app showed an error.",
     "expected_category": "Website problem"},
    {"text": "I can't log in to my account, it keeps saying wrong password.", "expected_category": "Website problem"},

    # Ambiguous / Other
    {"text": "I want to ask something about my last purchase.", "expected_category": "Other"},
    {"text": "Can I get a receipt for my order from yesterday?", "expected_category": "Other"},
    {"text": "Great service, just wanted to leave a compliment!", "expected_category": "Other"},
]


def run_tests():
    """
    Iterates through test cases, calls the NLP API, and prints the results.
    """
    print(f"{bcolors.HEADER}{bcolors.BOLD}--- Starting NLP Service Test Suite ---{bcolors.ENDC}\n")

    correct_predictions = 0

    for i, case in enumerate(TEST_CASES):
        test_text = case["text"]
        expected = case["expected_category"]

        payload = {
            "text": test_text,
            "categories": CANDIDATE_LABELS
        }

        try:
            # Send request to the Flask API
            response = requests.post(NLP_API_URL, json=payload, timeout=20)  # 20 second timeout
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

            result = response.json()
            predicted_category = result.get("category")
            confidence = result.get("confidence", 0)

            # Check if the prediction is correct
            is_correct = predicted_category == expected
            if is_correct:
                correct_predictions += 1

            # Print results for this case
            status_color = bcolors.OKGREEN if is_correct else bcolors.FAIL
            status_text = "PASS" if is_correct else "FAIL"

            print(f"{bcolors.BOLD}Test Case #{i + 1}: [{status_color}{status_text}{bcolors.ENDC}]")
            print(f"  Input Text: \"{test_text}\"")
            print(f"  Expected:   {bcolors.OKGREEN}{expected}{bcolors.ENDC}")
            print(f"  Predicted:  {status_color}{predicted_category}{bcolors.ENDC} (Confidence: {confidence:.2%})")
            print("-" * 40)

        except requests.exceptions.RequestException as e:
            print(f"{bcolors.FAIL}ERROR on Test Case #{i + 1}: Could not connect to the NLP service.{bcolors.ENDC}")
            print(f"  Details: {e}")
            print("-" * 40)
            # Stop further tests if the service is down
            break

    # Print final summary
    total_cases = len(TEST_CASES)
    accuracy = (correct_predictions / total_cases) * 100 if total_cases > 0 else 0

    print(f"\n{bcolors.HEADER}{bcolors.BOLD}--- Test Summary ---{bcolors.ENDC}")
    print(f"Total test cases: {total_cases}")
    print(f"Correct predictions: {bcolors.OKGREEN}{correct_predictions}{bcolors.ENDC}")
    print(f"Incorrect predictions: {bcolors.FAIL}{total_cases - correct_predictions}{bcolors.ENDC}")
    print(f"Accuracy: {bcolors.BOLD}{accuracy:.2f}%{bcolors.ENDC}\n")


if __name__ == "__main__":
    run_tests()