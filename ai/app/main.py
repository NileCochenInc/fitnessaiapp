import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from fastapi import FastAPI
from . import db
from . import exercise_embeddings
from . import workout_embeddings
from . import rag




app = FastAPI()
@app.get("/")
def read_root():
    return {"message": "AI service is running"}



# Load environment variables from .env file
load_dotenv()
if "MISTRAL_API_KEY" not in os.environ:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")
print ("Api key loaded successfully")


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


def endpoint():

    #exercise_embeddings.update_embeddings(2)
    workout_embeddings.update_embeddings(2)

    #print("Starting RAG test...")
    #rag.retrieve_exercises("how have my squats been progressing?", 2)

endpoint()
    

    

