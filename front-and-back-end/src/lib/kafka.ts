/**
 * Kafka producer utility for Node.js backend
 * Publishes events to Kafka topics
 */

import { Kafka, logLevel, Producer } from 'kafkajs';

let kafkaProducer: Producer | null = null;

const kafka = new Kafka({
  clientId: 'fitness-app-backend',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  logLevel: logLevel.ERROR, // Reduce noise in logs
});

/**
 * Initialize Kafka producer (call once on app startup)
 */
export async function initializeKafka() {
  try {
    kafkaProducer = kafka.producer();
    await kafkaProducer.connect();
    console.log('✓ Kafka producer connected');
    return kafkaProducer;
  } catch (error) {
    console.error('✗ Failed to connect Kafka producer:', error);
    // Don't throw - allow app to run without Kafka
    return null;
  }
}

/**
 * Publish workout-logged event to Kafka
 * Called when a workout is created or updated
 * 
 * @param userId - The user who logged the workout
 */
export async function publishWorkoutLogged(userId: number) {
  if (!kafkaProducer) {
    console.warn('⚠️  Kafka producer not initialized, skipping event publish');
    return;
  }

  try {
    await kafkaProducer.send({
      topic: 'workout-logged',
      messages: [
        {
          key: userId.toString(),
          value: userId.toString(), // Simple message: just the user ID
        },
      ],
    });
    console.log(`📤 Published workout-logged event for user ${userId}`);
  } catch (error) {
    console.error('✗ Failed to publish workout-logged event:', error);
    // Don't throw - non-critical to app operation
  }
}

/**
 * Disconnect Kafka producer (call on app shutdown)
 */
export async function disconnectKafka() {
  if (kafkaProducer) {
    try {
      await kafkaProducer.disconnect();
      console.log('✓ Kafka producer disconnected');
    } catch (error) {
      console.error('✗ Failed to disconnect Kafka producer:', error);
    }
  }
}

export { kafkaProducer };
