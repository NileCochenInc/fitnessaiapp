"""
Kafka consumer that processes embedding requests for workouts and exercises.

This service:
1. Listens for 'workout-logged' events from Kafka
2. Receives user_id in each message
3. Calls the batched embedding pipelines for that user
4. Processes one user at a time as messages arrive
"""

import json
import sys
from confluent_kafka import Consumer, KafkaError
from . import exercise_embeddings, workout_embeddings

# Kafka configuration
KAFKA_BROKER = "kafka:9092"
KAFKA_TOPIC = "workout-logged"
KAFKA_GROUP = "embedding-worker-group"


class EmbeddingConsumer:
    def __init__(self, broker=KAFKA_BROKER, topic=KAFKA_TOPIC, group=KAFKA_GROUP):
        """Initialize Kafka consumer"""
        self.broker = broker
        self.topic = topic
        
        self.consumer = Consumer({
            'bootstrap.servers': broker,
            'group.id': group,
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': True,
        })
        
        self.consumer.subscribe([topic])
        print(f"✓ Connected to Kafka broker: {broker}")
        print(f"✓ Listening on topic: {topic}")
    
    def run(self):
        """Main loop: consume messages and process embeddings"""
        print("=== Embedding Worker Started ===\n")
        
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"✗ Kafka error: {msg.error()}")
                        continue
                
                # Process message
                self._process_message(msg)
        
        except KeyboardInterrupt:
            print("\n=== Embedding Worker Stopped ===")
        finally:
            self.consumer.close()
    
    def _process_message(self, msg):
        """Extract user_id from message and process embeddings"""
        try:
            # Parse message
            message_value = msg.value().decode('utf-8')
            user_id = int(message_value)
            
            print(f"\n📨 Received embedding request for user {user_id}")
            
            # Process embeddings for this user
            self._generate_embeddings(user_id)
            
            print(f"✓ Completed embedding generation for user {user_id}\n")
        
        except json.JSONDecodeError as e:
            print(f"✗ Failed to parse message: {e}")
        except ValueError as e:
            print(f"✗ Invalid user_id format: {e}")
        except Exception as e:
            print(f"✗ Error processing message: {e}")
            import traceback
            traceback.print_exc()
    
    def _generate_embeddings(self, user_id):
        """Call the batched embedding pipelines for a user"""
        try:
            # Get unembedded exercises for this user
            exercises = exercise_embeddings.get_unembedded_exercises(user_id)
            if exercises:
                print(f"  📊 Processing {len(exercises)} exercises")
                # Format exercises into text
                formatted_exercises = exercise_embeddings.format_exercises(exercises)
                # Generate embeddings (batched API call)
                exercise_embeddings_result = exercise_embeddings.make_exercise_embeddings(formatted_exercises)
                # Save to database
                exercise_embeddings.save_exercise_embeddings(exercise_embeddings_result)
            
            # Get unembedded workouts for this user
            workouts = workout_embeddings.get_unembedded_workouts(user_id)
            if workouts:
                print(f"  📊 Processing {len(workouts)} workouts")
                # Format workouts into text
                formatted_workouts = workout_embeddings.format_workouts(workouts)
                # Generate embeddings (batched API call)
                workout_embeddings_result = workout_embeddings.make_workout_embeddings(formatted_workouts)
                # Save to database
                workout_embeddings.save_workout_embeddings(workout_embeddings_result)
            
            if not exercises and not workouts:
                print(f"  ℹ️  No unembedded items for user {user_id}")
        
        except Exception as e:
            print(f"  ✗ Error generating embeddings: {e}")
            raise


def main():
    """Entry point for the embedding worker"""
    try:
        consumer = EmbeddingConsumer()
        consumer.run()
    except Exception as e:
        print(f"✗ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
