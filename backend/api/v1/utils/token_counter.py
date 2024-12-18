import tiktoken

def count_tokens(text: str, model: str) -> int:
    """Count the number of tokens in a text string for a specific model."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fall back to cl100k_base encoding for unknown models
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text)) 