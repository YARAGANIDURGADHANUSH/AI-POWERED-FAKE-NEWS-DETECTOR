from groq import Groq
import os, json, re

client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None


def classify_claim(text):
    if not client:
        return "GENERAL"

    prompt = f"""
Classify this claim:

"{text}"

Options:
FACTUAL, NEWS, OPINION, HISTORICAL, SCIENTIFIC, NONSENSE

Return JSON:
{{"type": "..."}}
"""

    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        raw = res.choices[0].message.content
        match = re.search(r"\{.*\}", raw, re.DOTALL)

        if match:
            return json.loads(match.group())["type"]

    except:
        pass

    return "GENERAL"
