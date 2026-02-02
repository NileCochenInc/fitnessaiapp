from langchain_mistralai import ChatMistralAI

router_llm = ChatMistralAI(
    model="ministral-3b-latest",
    temperature=0,
    max_tokens=15,
    # other params...
)

def get_rag_direction(prompt:str, context:list=[]) -> str:

    previous_queries = ""
    if context:
        for role, message in context:
            if role == "human":
                previous_queries += f"User: {message}\n"



    classification_prompt = """You are a routing classifier for a fitness tracking app.

    Each option refers to a DIFFERENT type of stored data:

    EXERCISES:
    - Individual exercises
    - Single movements (e.g. bicep curls, squats)
    - Usually tied to a specific date
    - Questions about muscles, form, or specific exercises

    WORKOUTS:
    - A full gym session (one trip to the gym)
    - Contains multiple exercises done together
    - Questions about workout plans, progress over time, or full sessions

    BOTH:
    - Questions that need individual exercises AND full workouts

    NEITHER:
    - General fitness advice or concepts
    - Not answered using stored exercise or workout data

    Respond with EXACTLY ONE word:
    EXERCISES, WORKOUTS, BOTH, or NEITHER.

    Conversation previous queries:
    {previous_queries}

    Query:
    User: {prompt}
    """

    response = router_llm.invoke([
        ("human", classification_prompt.format(prompt=prompt, previous_queries=previous_queries)),
    ])
    
    route = response.content.strip().upper()

    if route not in {"EXERCISES", "WORKOUTS", "BOTH", "NEITHER"}:
        route = "NEITHER"  # safe fallback

    print(route)
    return route