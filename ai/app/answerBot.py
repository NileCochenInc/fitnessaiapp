from langchain_mistralai import ChatMistralAI

system_message = """
You are a helpful fitness assistant.
- Be concise and practical
- Prefer bullet points
- Limit answers to ~150 words unless explicitly asked to elaborate
"""


llm = ChatMistralAI(
    model="ministral-8b-latest",
    temperature=0,
    max_retries=2,
    max_tokens=1000,
    # other params...
)



# input: (role, content) list
# role must alternate between "human" and "ai" starting with "human" ending with "ai"
def chat(messages: list[tuple[str, str]]):
    messages.insert(0, ("system", system_message))

    ai_msg = llm.invoke(messages)
    #print(ai_msg.content)
    return ai_msg.content