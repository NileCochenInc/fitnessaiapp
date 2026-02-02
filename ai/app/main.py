import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio
from . import db
from . import exercise_embeddings
from . import workout_embeddings
from . import rag
from . import answerBot

app = FastAPI()

# ----------------------------
# Per-user event storage
# user_events[user_id] = list of progress messages for that user
user_events = {}
# ----------------------------

# ----------------------------
# Current request shape for /chat:
# Headers:
#   user-id: <string>  -> unique identifier for the user/session
# Body (JSON, optional):
#   {
#       "prompt": "<string>",        # the user prompt or message
#       "context": ["msg1", ...]     # optional conversation context
#   }
# ----------------------------

async def agent_task(user_id: str, prompt: str = "", context: list = []):
    """Simulated agent task: appends progress updates to user_events[user_id]."""
    try:
        print(f"[agent_task] Starting for user {user_id}, prompt: {prompt}")
        user_events[user_id].append("System_message: Answering your question...")

        await asyncio.sleep(0.5)
        
        print(f"[agent_task] Calling answerBot.chat with context length: {len(context)}")
        ai_msg = answerBot.chat(context + [("human", prompt)])
        print(f"[agent_task] Got response: {ai_msg[:100] if ai_msg else 'EMPTY'}")

        if ai_msg:
            user_events[user_id].append(f"AI_message: {ai_msg}")
        else:
            print(f"[agent_task] WARNING: ai_msg is empty!")
            user_events[user_id].append("AI_message: (No response from AI)")
        
        user_events[user_id].append("Finished!")
    except Exception as e:
        print(f"[agent_task] ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        user_events[user_id].append(f"AI_message: Error: {str(e)}")
        user_events[user_id].append("Finished!")

@app.post("/chat")
async def start_agent(request: Request):
    # Get user ID from header
    user_id = request.headers.get("user-id")
    if not user_id:
        return {"error": "Missing user ID in headers"}

    # Read JSON body (optional)
    data = await request.json()
    prompt = data.get("prompt", "")
    context = data.get("context", [])

    # Clear any previous events for this user
    user_events[user_id] = []

    # Launch agent task asynchronously
    asyncio.create_task(agent_task(user_id, prompt, context))

    return {"status": f"Agent started for user {user_id}"}

async def event_generator(user_id: str):
    """Yield events for the given user as SSE, then stop after 'Finished!'."""
    last_index = 0
    while True:
        events = user_events.get(user_id, [])
        if last_index < len(events):
            for e in events[last_index:]:
                yield f"data: {e}\n\n"
                if e == "Finished!":
                    # Optionally clear events after finished
                    user_events[user_id].clear()
                    return
            last_index = len(events)
        await asyncio.sleep(0.1)



# Request shape for /progress endpoint:
# Method: GET
# Headers:
#   user-id: <string>  -> unique identifier for the user/session
# Body: None
# Response: SSE stream of progress messages for that user
# Example curl:
#   curl http://localhost:5001/progress -H "user-id: 12345"
@app.get("/progress")
async def progress_endpoint(request: Request):
    # Get user ID from header
    user_id = request.headers.get("user-id")
    if not user_id:
        return {"error": "Missing user ID in headers"}

    return StreamingResponse(event_generator(user_id), media_type="text/event-stream")


# Load environment variables
load_dotenv()
if "MISTRAL_API_KEY" not in os.environ:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")
print("API key loaded successfully")


# Example endpoint to run test code (optional)
def endpoint():
    # exercise_embeddings.update_embeddings(2)
    # workout_embeddings.update_embeddings(2)
    # print("Starting RAG test...")
    # rag.retrieve_workouts("Is my upper body routine hitting all muscle groups?", 2)

    chat_messages = [
        ("human", "Tell me about yourself."),
        ("ai", "I am an AI assistant that helps with fitness workouts and exercises."),
        ("human", "Can you help me create a workout plan?")
    ]

    # answerBot.chat(chat_messages)

endpoint()
