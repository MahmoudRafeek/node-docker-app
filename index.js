const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const port = 3000;

const kafka = new Kafka({
  clientId: 'my-express-app',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'mahmoud-group' }); // لازم جروب عشان كافكا يعرف مين قرأ إيه

// دالة التشغيل (Producer + Consumer)
const initKafka = async () => {
  try {
    // 1. تشغيل الـ Producer
    await producer.connect();
    console.log("✅ Kafka Producer Connected");

    // 2. تشغيل الـ Consumer
    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`📩 رسالة جديدة وصلت للـ Consumer: ${message.value.toString()}`);
      },
    });
    console.log("✅ Kafka Consumer Running & Listening...");

  } catch (err) {
    console.error("❌ Kafka Error:", err);
    setTimeout(initKafka, 5000);
  }
};

initKafka();

app.get('/send', async (req, res) => {
  const msg = req.query.msg || "Default Message";
  try {
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: msg }],
    });
    res.send(`🚀 Sent: ${msg}`);
  } catch (err) {
    res.status(500).send("❌ Error: " + err.message);
  }
});

app.get('/', (req, res) => {
  res.send("<h1>Kafka Producer & Consumer are Running!</h1>");
});

app.listen(port, () => {
  console.log(`🚀 Server on http://localhost:${port}`);
});