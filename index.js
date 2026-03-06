const express = require('express');
const { Kafka, logLevel } = require('kafkajs');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());

// --- 1. الربط بـ MongoDB (لوكال على جهازك) ---
// بنستخدم host.docker.internal عشان يكلم المونجو اللي بره الدوكر
const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/mahmoud_db';
mongoose.connect(mongoURI)
  .then(() => console.log("🍃 MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// تعريف شكل البيانات (Schema)
const MsgSchema = new mongoose.Schema({
  text: String,
  receivedAt: { type: Date, default: Date.now }
});
const MsgModel = mongoose.model('Message', MsgSchema);


// --- 2. إعدادات كافكا ---
const kafka = new Kafka({
  clientId: 'my-express-app',
  brokers: ['kafka:9092'],
  logLevel: logLevel.NOTHING 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'mahmoud-group' });

const initKafka = async () => {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer Connected");

    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        const incomingMsg = message.value.toString();
        console.log(`📩 Consumer Received: ${incomingMsg}`);

        // --- 3. حفظ الرسالة في MongoDB ---
        try {
          const newDoc = new MsgModel({ text: incomingMsg });
          await newDoc.save();
          console.log("💾 Saved to MongoDB!");
        } catch (dbErr) {
          console.error("❌ Failed to save to DB:", dbErr);
        }
      },
    });
    console.log("✅ Kafka Consumer Running...");
  } catch (err) {
    setTimeout(initKafka, 5000);
  }
};

initKafka();

// --- 4. الـ Route اللي بياخد من الـ Body ---
app.post('/send', async (req, res) => {
  try {
    const { msg } = req.body; 
    if (!msg) return res.status(400).send("Please provide 'msg' in body");

    await producer.send({
      topic: 'test-topic',
      messages: [{ value: msg }],
    });

    res.status(200).json({ status: "Sent to Kafka", data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`🚀 Server on port ${port}`));