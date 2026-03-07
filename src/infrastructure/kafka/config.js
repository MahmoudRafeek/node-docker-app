const { Kafka, logLevel } = require('kafkajs');

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
      clientId: "my-express-app",
      brokers: ["kafka:9092"],
      logLevel: logLevel.NOTHING 
       });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "mahmoud-group" });
  }

  async produce(topic, messages) {
    try {
      await this.producer.connect();
      console.log("✅ Kafka Producer Connected -----------");
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (error) {
      console.error(error);
    } finally {
      await this.producer.disconnect();
    }
  }

  async consume(topic, callback) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          console.log(`📩 Consumer Received---------: ${value}`);
          callback(value);
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}

// export default new KafkaConfig();
module.exports = new KafkaConfig();
