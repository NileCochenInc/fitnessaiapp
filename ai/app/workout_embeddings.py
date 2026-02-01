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
    
    return list(workouts_dict.values())


def print_workouts(workouts):
    print("printing workouts")
    print()
    
    for workout in workouts:
        print(f"Workout on {workout['workout_date']} ({workout['workout_kind']})")
        
        for exercise in workout['exercises']:
            print(f"  Performed {exercise['exercise_name']}")
            
            if exercise['note'] is not None:
                print(f"  Note: {exercise['note']}")
            
            for entry in sorted(exercise['entries'], key=lambda e: e['entry_index']):
                # Build metric string for this entry
                metrics_str = ", ".join([
                    f"{metric['key']} {metric['value_number']}{' ' + metric['unit'] if metric['unit'] else ''}"
                    for metric in entry['metrics']
                ])
                print(f"    {metrics_str}")

# (int, str) list
def format_workouts(workouts):
    formatted = []
    
    for workout in workouts:
        # Build the embedding text for the entire workout
        embedding_lines = [f"Workout on {workout['workout_date']} ({workout['workout_kind']})"]
        
        for exercise in workout['exercises']:
            embedding_lines.append(f"Performed {exercise['exercise_name']}")
            
            if exercise['note'] is not None:
                embedding_lines.append(f"  Note: {exercise['note']}")
            
            for entry in sorted(exercise['entries'], key=lambda e: e['entry_index']):
                metrics_str = ", ".join([
                    f"{metric['key']} {metric['value_number']}{' ' + metric['unit'] if metric['unit'] else ''}"
                    for metric in entry['metrics']
                ])
                embedding_lines.append(f"  {metrics_str}")
        
        # Combine lines into single string
        embedding_text = "\n".join(embedding_lines)
        
        # Add tuple of (workout_id, embedding_text)
        formatted.append((workout['workout_id'], embedding_text))
    
    #print(formatted[0][1])

    return formatted

def make_workout_embeddings(formatted_workouts):
    # Extract texts from (workout_id, embedding_text) tuples
    texts = [embedding_text for _, embedding_text in formatted_workouts]
    
    # Get embeddings from LangChain
    vectors = embeddings.embed_documents(texts)
    
    # Combine vectors with original IDs and texts
    results = [
        (vector, workout_id, embedding_text)
        for vector, (workout_id, embedding_text) in zip(vectors, formatted_workouts)
    ]
    
    #print(results[0])
    return results


def save_workout_embeddings(workout_embeddings):
    """Save workout embeddings and text to the database in batch.
    
    Args:
        workout_embeddings: List of tuples (vector, workout_id, embedding_text)
                           where vector is a list of floats
    """
    if not workout_embeddings:
        print("No embeddings to save")
        return
    
    # Build CASE statements for both embeddings and text
    embedding_cases = []
    text_cases = []
    params = {}
    
    for idx, (vector, workout_id, embedding_text) in enumerate(workout_embeddings):
        # Convert vector list to string format for pgvector
        vector_str = "[" + ",".join(str(v) for v in vector) + "]"
        vector_key = f"vector_{idx}"
        text_key = f"text_{idx}"
        params[vector_key] = vector_str
        params[text_key] = embedding_text
        params[f"id_{idx}"] = workout_id
        
        embedding_cases.append(f"WHEN :id_{idx} THEN :{vector_key}")
        text_cases.append(f"WHEN :id_{idx} THEN :{text_key}")
    
    # Build the batch update query
    ids = [id for _, id, _ in workout_embeddings]
    params["ids"] = ids
    
    query = f"""UPDATE workouts 
                SET embeddings = CASE id
                    {' '.join(embedding_cases)}
                    ELSE embeddings
                END,
                workout_text = CASE id
                    {' '.join(text_cases)}
                    ELSE workout_text
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

    print("formatting workouts")
    formatted_workouts = format_workouts(workouts)

    print("making embeddings")
    workout_embeddings = make_workout_embeddings(formatted_workouts)

    print("saving embeddings")
    save_workout_embeddings(workout_embeddings)



    


    
