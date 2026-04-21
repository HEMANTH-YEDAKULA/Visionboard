import math
import os
import pickle
import random

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES = ["daysLeft", "progressRate", "completionRate", "streak", "consistencyScore"]


def sigmoid(value):
    if value < -60:
        return 0.0
    if value > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-value))


def normalize_row(row):
    return [
        max(0.0, min(1.0, row["daysLeft"] / 60.0)),
        max(0.0, min(1.0, row["progressRate"])),
        max(0.0, min(1.0, row["completionRate"])),
        max(0.0, min(1.0, row["streak"] / 14.0)),
        max(0.0, min(1.0, row["consistencyScore"])),
    ]


def generate_dataset(size=12000, seed=7):
    random.seed(seed)
    rows = []

    for _ in range(size):
      days_left = random.randint(0, 60)
      progress_rate = random.random()
      completion_rate = random.random()
      streak = random.randint(0, 14)
      consistency = random.random()

      score = (
          completion_rate * 2.5 +
          progress_rate * 1.8 +
          consistency * 1.6 +
          (streak / 14.0) * 0.8 -
          (0.8 if days_left < 5 and completion_rate < 0.6 else 0.0) -
          (0.5 if days_left < 10 and progress_rate < 0.4 else 0.0) +
          (0.4 if days_left > 20 else 0.0)
      )
      probability = sigmoid(score - 2.0)
      label = 1 if random.random() < probability else 0

      rows.append((
          {
              "daysLeft": days_left,
              "progressRate": progress_rate,
              "completionRate": completion_rate,
              "streak": streak,
              "consistencyScore": consistency,
          },
          label,
      ))

    return rows


def train(iterations=45, learning_rate=0.08):
    dataset = generate_dataset()
    weights = [0.0 for _ in FEATURES]
    bias = 0.0

    for _ in range(iterations):
        for row, label in dataset:
            values = normalize_row(row)
            linear = sum(weight * value for weight, value in zip(weights, values)) + bias
            prediction = sigmoid(linear)
            error = prediction - label

            for index, value in enumerate(values):
                weights[index] -= learning_rate * error * value
            bias -= learning_rate * error

    model = {
        "weights": weights,
        "bias": bias,
        "features": FEATURES,
    }

    with open(MODEL_PATH, "wb") as handle:
        pickle.dump(model, handle)

    return model


if __name__ == "__main__":
    train()
