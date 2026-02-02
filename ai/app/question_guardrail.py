from langchain_mistralai import ChatMistralAI

router_llm = ChatMistralAI(
    model="ministral-3b-latest",
    temperature=0,
    max_tokens=15,
)

MEDICAL_RESPONSE = """AI_message: I can't provide medical advice or diagnose injuries or conditions.

**For pain, injuries, or medical concerns**, please consult a qualified healthcare professional.

I can help with:
- General fitness training
- Exercise selection
- Workout structure

Feel free to ask if you'd like assistance with any of these!"""


NON_FITNESS_RESPONSE = """AI_message: I'm designed to help with fitness and training-related questions.

Try asking about:
- Workouts
- Exercises
- Progress
- Recovery"""


def check_guardrails(prompt: str, context: list = []):
    previous_queries = ""
    if context:
        for role, message in context:
            if role == "human":
                previous_queries += f"User: {message}\n"

    guardrail_prompt = """
        You are a guardrail classifier for a fitness-focused AI application.

        Your task is to classify the user's message into exactly ONE of the following labels:

        - FITNESS_OK
        The request is related to fitness, exercise, training, workouts, recovery, or general nutrition and can be safely answered.

        - MEDICAL_ADVICE
        The request asks for medical advice, diagnosis, treatment, injury evaluation, medication guidance, or health decisions that should be handled by a medical professional.

        - NON_FITNESS
        The request is not related to fitness, exercise, or training (e.g., programming, general knowledge, writing tasks).

        Rules:
        - Do NOT answer the user.
        - Do NOT explain your reasoning.
        - Do NOT add extra text.
        - Output ONLY the label.

        If the request is ambiguous, choose the safest applicable label.

        Conversation previous prompts:
        {previous_queries}

        Current User Prompt to judge:
        {prompt}
    """

    response = router_llm.invoke([
        ("human", guardrail_prompt.format(prompt=prompt, previous_queries=previous_queries)),
    ])
    
    classification = response.content.strip().upper()

    #default ok
    if classification not in {"FITNESS_OK", "MEDICAL_ADVICE", "NON_FITNESS"}:
        classification = "FITNESS_OK"
    print(classification)
    return classification
