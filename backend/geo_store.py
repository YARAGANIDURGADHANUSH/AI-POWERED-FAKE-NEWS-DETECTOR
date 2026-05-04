import json
import os
from datetime import datetime

DB_FILE = "geo_stats.json"


def load_db():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        return json.load(f)


def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)


def update_state(state, label):
    db = load_db()

    today = datetime.now().strftime("%Y-%m-%d")

    if state not in db:
        db[state] = {
            "total": 0,
            "fake": 0,
            "real": 0,
            "history": {}
        }

    db[state]["total"] += 1

    if label == "FAKE":
        db[state]["fake"] += 1
    elif label == "REAL":
        db[state]["real"] += 1

    # 🔥 trend data
    if today not in db[state]["history"]:
        db[state]["history"][today] = {"fake": 0, "real": 0}

    if label == "FAKE":
        db[state]["history"][today]["fake"] += 1
    elif label == "REAL":
        db[state]["history"][today]["real"] += 1

    save_db(db)


# =========================
# HEATMAP
# =========================
def get_heatmap():
    db = load_db()
    result = {}

    for state, data in db.items():
        total = data["total"]
        if total == 0:
            score = 0
        else:
            score = data["fake"] / total

        result[state] = round(score, 2)

    return result


# =========================
# 🏆 LEADERBOARD
# =========================
def get_leaderboard():
    db = load_db()
    ranking = []

    for state, data in db.items():
        total = data["total"]
        fake = data["fake"]

        score = fake / total if total > 0 else 0

        ranking.append({
            "state": state,
            "fake_index": round(score, 2),
            "total_checks": total
        })

    ranking.sort(key=lambda x: x["fake_index"], reverse=True)
    return ranking


# =========================
# 📈 TRENDS
# =========================
def get_trends(state):
    db = load_db()

    if state not in db:
        return {}

    return db[state]["history"]