from sqlmodel import Session, SQLModel, text
from . import db
from langchain_mistralai import MistralAIEmbeddings

embeddings = MistralAIEmbeddings(
    model="mistral-embed",
)

def get_unembedded_workouts(id: int):
    query = """SELECT 
                    w.id AS workout_id,
                    w.workout_date,
                    w.workout_kind,
                    we.id AS workout_exercise_id,
                    e.name AS exercise_name,
                    we.note,
                    en.id AS entry_id,
                    en.entry_index,
                    md.key AS metric_key,
                    em.value_number,
                    em.value_text,
                    em.unit
                FROM workouts w
                JOIN workout_exercises we ON w.id = we.workout_id
                JOIN exercises e ON we.exercise_id = e.id
                LEFT JOIN entries en ON we.id = en.workout_exercise_id
                LEFT JOIN entry_metrics em ON en.id = em.entry_id
                LEFT JOIN metric_definitions md ON em.metric_id = md.id
                WHERE w.embeddings IS NULL
                AND w.user_id = :user_id
                ORDER BY w.id, we.id, en.entry_index;"""
    
    result = db.session.execute(text(query), {"user_id": id})

    workouts_dict = {}
    for row in result:
        w_id = row.workout_id
        we_id = row.workout_exercise_id
        
        if w_id not in workouts_dict:
            workouts_dict[w_id] = {
                'workout_id': w_id,
                'workout_date': row.workout_date,
                'workout_kind': row.workout_kind,
                'exercises': {}
            }
        
        if we_id not in workouts_dict[w_id]['exercises']:
            workouts_dict[w_id]['exercises'][we_id] = {
                'workout_exercise_id': we_id,
                'exercise_name': row.exercise_name,
                'note': row.note,
                'entries': {}
            }
        
        if row.entry_id and row.entry_id not in workouts_dict[w_id]['exercises'][we_id]['entries']:
            workouts_dict[w_id]['exercises'][we_id]['entries'][row.entry_id] = {
                'entry_index': row.entry_index,
                'metrics': []
            }
        
        if row.metric_key:
            workouts_dict[w_id]['exercises'][we_id]['entries'][row.entry_id]['metrics'].append({
                'key': row.metric_key,
                'value_number': row.value_number,
                'value_text': row.value_text,
                'unit': row.unit
            })
    
    # Convert nested dictionaries to lists
    for w_id in workouts_dict:
        workouts_dict[w_id]['exercises'] = list(workouts_dict[w_id]['exercises'].values())
        for exercise in workouts_dict[w_id]['exercises']:
            exercise['entries'] = list(exercise['entries'].values())

    print (list(workouts_dict.values()))
    
    return list(workouts_dict.values())


def print_exercises(exercises):
    print("making embeddings")
    print()
    
    #exercise = exercises[1]
    for exercise in exercises:
        print(f"On {exercise['workout_date']} performed {exercise['exercise_name']}")
        
        if exercise['note'] is not None:
            print(f"Note: {exercise['note']}")
        
        for entry in sorted(exercise['entries'].values(), key=lambda e: e['entry_index']):
            # Build metric string for this entry
            metrics_str = ", ".join([
                f"{metric['key']} {metric['value_number']}{' ' + metric['unit'] if metric['unit'] else ''}"
                for metric in entry['metrics']
            ])
            print(f"  {metrics_str}")

# (int, str) list
def format_exercises(exercises):
    embeddings = []
    
    for exercise in exercises:
        # Build the embedding text
        embedding_lines = [f"On {exercise['workout_date']} performed {exercise['exercise_name']}"]
        
        if exercise['note'] is not None:
            embedding_lines.append(f"Note: {exercise['note']}")
        
        for entry in sorted(exercise['entries'].values(), key=lambda e: e['entry_index']):
            metrics_str = ", ".join([
                f"{metric['key']} {metric['value_number']}{' ' + metric['unit'] if metric['unit'] else ''}"
                for metric in entry['metrics']
            ])
            embedding_lines.append(f"  {metrics_str}")
        
        # Combine lines into single string
        embedding_text = "\n".join(embedding_lines)
        
        # Add tuple of (workout_exercise_id, embedding_text)
        embeddings.append((exercise['workout_exercise_id'], embedding_text))
    
    return embeddings

def make_exercise_embeddings(formatted_exercises):
    # Extract texts from (workout_exercise_id, embedding_text) tuples
    texts = [embedding_text for _, embedding_text in formatted_exercises]
    
    # Get embeddings from LangChain
    vectors = embeddings.embed_documents(texts)
    
    # Combine vectors with original IDs and texts
    results = [
        (vector, workout_exercise_id, embedding_text)
        for vector, (workout_exercise_id, embedding_text) in zip(vectors, formatted_exercises)
    ]
    
    #print(results[0])
    return results


def save_exercise_embeddings(exercise_embeddings):
    """Save exercise embeddings and text to the database in batch.
    
    Args:
        exercise_embeddings: List of tuples (vector, workout_exercise_id, embedding_text)
                           where vector is a list of floats
    """
    if not exercise_embeddings:
        print("No embeddings to save")
        return
    
    # Build CASE statements for both embeddings and text
    embedding_cases = []
    text_cases = []
    params = {}
    
    for idx, (vector, workout_exercise_id, embedding_text) in enumerate(exercise_embeddings):
        # Convert vector list to string format for pgvector
        vector_str = "[" + ",".join(str(v) for v in vector) + "]"
        vector_key = f"vector_{idx}"
        text_key = f"text_{idx}"
        params[vector_key] = vector_str
        params[text_key] = embedding_text
        params[f"id_{idx}"] = workout_exercise_id
        
        embedding_cases.append(f"WHEN :id_{idx} THEN :{vector_key}")
        text_cases.append(f"WHEN :id_{idx} THEN :{text_key}")
    
    # Build the batch update query
    ids = [id for _, id, _ in exercise_embeddings]
    params["ids"] = ids
    
    query = f"""UPDATE workout_exercises 
                SET embeddings = CASE id
                    {' '.join(embedding_cases)}
                    ELSE embeddings
                END,
                exercise_text = CASE id
                    {' '.join(text_cases)}
                    ELSE exercise_text
                END
                WHERE id = ANY(:ids)"""
    
    try:
        result = db.session.execute(text(query), params)
        db.session.commit()
        print(f"Successfully saved {result.rowcount} embeddings")
    except Exception as e:
        db.session.rollback()
        print(f"Error saving embeddings: {e}")
        raise



def update_embeddings(id:int) -> None:

    print("updating embeddings")
    workouts = get_unembedded_workouts(id)

    #print("formatting exercises")
    #formatted_workouts = format_workouts(workouts)

    #print("making embeddings")
    #exercise_workouts = make_exercise_workouts(formatted_workouts)

    #print("saving embeddings")
    #save_exercise_workouts(exercise_workouts)




    


    
