import json
import math
import os
import pickle
import sys

from train_model import train

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")


def sigmoid(value):
    if value < -60:
        return 0.0
    if value > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-value))


def normalize(goal):
    return [
        max(0.0, min(1.0, goal.get("daysLeft", 30) / 60.0)),
        max(0.0, min(1.0, goal.get("progressRate", 0.0))),
        max(0.0, min(1.0, goal.get("completionRate", 0.0))),
        max(0.0, min(1.0, goal.get("streak", 0) / 14.0)),
        max(0.0, min(1.0, goal.get("consistencyScore", 0.0))),
    ]


def load_model():
    if not os.path.exists(MODEL_PATH):
        return train()

    with open(MODEL_PATH, "rb") as handle:
        return pickle.load(handle)


def classify(probability):
    if probability >= 0.75:
        return "On Track"
    if probability >= 0.45:
        return "At Risk"
    return "Likely to Fail"


def predict(goals):
    model = load_model()
    results = []

    for goal in goals:
        features = normalize(goal)
        linear = sum(weight * value for weight, value in zip(model["weights"], features)) + model["bias"]
        probability = round(sigmoid(linear), 2)
        results.append({
            "goalId": goal["goalId"],
            "probability": probability,
            "status": classify(probability),
        })

    return results


if __name__ == "__main__":
    payload = json.loads(sys.stdin.read() or "{}")
    output = predict(payload.get("goals", []))
    print(json.dumps(output))
