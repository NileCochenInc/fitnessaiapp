from langchain_mistralai import ChatMistralAI

system_message = "You are a helpful assistant that answers questions about fitness workouts and exercises."


llm = ChatMistralAI(
    model="ministral-8b-latest",
    temperature=0,
    max_retries=2,
    # other params...
)
def test_ai():
    messages = [
        (
            "system",
            "You are an assistant that answers questions",
        ),
        ("human", "Tell me about yourself."),
    ]
    ai_msg = llm.invoke(messages)
    print(ai_msg.content)
    messages.append(("ai", ai_msg.content))
    messages.append(("human", "Can you elaborate on that?"))
    ai_msg = llm.invoke(messages)
    print(ai_msg.content)


# input: (role, content) list
# role must alternate between "human" and "ai" starting with "human" ending with "ai"
def chat(messages: list[tuple[str, str]]):
    messages.insert(0, ("system", system_message))

    ai_msg = llm.invoke(messages)
    print(ai_msg.content)
    return ai_msg.content