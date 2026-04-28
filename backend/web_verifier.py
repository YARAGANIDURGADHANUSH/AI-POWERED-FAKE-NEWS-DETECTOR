import requests

def search_news(query: str):
    url = f"https://api.duckduckgo.com/?q={query}&format=json"

    try:
        response = requests.get(url)
        data = response.json()

        results = []

        for topic in data.get("RelatedTopics", [])[:5]:
            if "Text" in topic:
                results.append(topic["Text"])

        return results

    except Exception as e:
        return []