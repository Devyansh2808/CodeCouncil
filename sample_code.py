def get_user_average_score(users, user_id):
    for user in users:
        if user["id"] == user_id:
            scores = user["scores"]

            total = 0
            # Logic bug: skips the last score
            for i in range(len(scores) - 1):
                total += scores[i]

            return total / len(scores)

    # Poor error handling: returns None instead of raising an error
    return None


users = [
    {"id": 1, "scores": [80, 90, 100]},
    {"id": 2, "scores": [70, 75, 85]}
]

print(get_user_average_score(users, 1))