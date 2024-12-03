import aisuite as ai
client = ai.Client()

models = ["openai:gpt-4o-mini", "anthropic:claude-3-5-haiku-20241022"]

messages = [
    {"role": "system", "content": "Respond in Pirate English."},
    {"role": "user", "content": "Tell me a joke."},
]

def main():
    for model in models:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.75
        )
        print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
