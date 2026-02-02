from . import db
from langchain_mistralai import MistralAIEmbeddings
from sqlmodel import text
from pprint import pprint


embeddings = MistralAIEmbeddings(
    model="mistral-embed",
)



def retrieve_exercises(prompt: str, user_id: int, limit: int = 10):
    # Get embedding for the query
    query_vector = embeddings.embed_query(prompt)

    # Convert to pgvector format
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

    # Search database using cosine similarity
    result = db.session.execute(text("""
        SELECT we.id, we.exercise_text,
               we.embeddings <=> :query_vector AS distance
        FROM workout_exercises we
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.user_id = :user_id AND we.embeddings IS NOT NULL
        ORDER BY we.embeddings <=> :query_vector
        LIMIT :limit
    """), {"query_vector": vector_str, "user_id": user_id, "limit": limit})
    
    rows = result.fetchall()
    
    # Convert rows to dictionaries with similarity score

    result = [
        {
            "id": row[0],
            "exercise_text": row[1],
            "similarity": 1 - row[2]
        }
        for row in rows
    ]

    #pprint(result)

    return result


def retrieve_workouts(prompt: str, user_id: int, limit: int = 10):
    # Get embedding for the query
    query_vector = embeddings.embed_query(prompt)

    # Convert to pgvector format
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

    # Search database using cosine similarity
    result = db.session.execute(text("""
        SELECT w.id, w.workout_text,
               w.embeddings <=> :query_vector AS distance
        FROM workouts w
        WHERE w.user_id = :user_id AND w.embeddings IS NOT NULL
        ORDER BY w.embeddings <=> :query_vector
        LIMIT :limit
    """), {"query_vector": vector_str, "user_id": user_id, "limit": limit})
    
    rows = result.fetchall()
    
    # Convert rows to dictionaries with similarity score
    result = [
        {
            "id": row[0],
            "workout_text": row[1],
            "similarity": 1 - row[2]
        }
        for row in rows
    ]

    #pprint(result)

    return result

def get_data(prompt: str, user_id: int, route: str) -> str:
    
    formatted_context = ""
    match route:
        case "EXERCISES":
            data = retrieve_exercises(prompt, user_id, limit=10)
            formatted_context = "\n\n".join([
                f"{item['exercise_text']}"
                for item in data
            ])
        case "WORKOUTS":
            data = retrieve_workouts(prompt, user_id, limit=10)
            formatted_context = "\n\n".join([
                f"{item['workout_text']}"
                for item in data
            ])
        case "BOTH":
            exercises = retrieve_exercises(prompt, user_id, limit=5)
            formatted_context = "--- EXERCISES ---\n"
            formatted_context += "\n\n".join([
                f"{item['exercise_text']}"
                for item in exercises
            ])
            workouts = retrieve_workouts(prompt, user_id, limit=5)
            formatted_context += "\n\n--- WORKOUTS ---\n"
            formatted_context += "\n\n".join([
                f"{item['workout_text']}"
                for item in workouts
            ])
        case "NEITHER":
            formatted_context = "no relevant data found"
        case _:
            formatted_context = "no relevant data found"

    #print(formatted_context)

    full_prompt = f"""You will be given:
                    1) A user question
                    2) Retrieved context entries from a database

                    Some context entries may be irrelevant or only partially relevant.
                    Use only the context that helps answer the question.
                    If the context does not contain enough information, say so clearly.
                    Do not invent facts.

                    --- USER QUESTION ---
                    {prompt}

                    --- RETRIEVED CONTEXT ---
                    {formatted_context}

                    --- INSTRUCTIONS ---
                    Answer the question using the relevant context above.
                    Ignore irrelevant entries."""
    
    #print(full_prompt)
    return full_prompt
  