const express = require('express');
const connectDB = require("./src/infrastructure/database/db");
const ActivityLog = require("./src/domain/user");
const kafkaConfig = require ("./src/infrastructure/kafka/config");
const app = express();
const port = 3000;

app.use(express.json());

connectDB();

kafkaConfig.consume("test-topic", async (data) => {
  try {

    const newLog = new ActivityLog({
      userId: data.userId,
      action: data.action,
      metadata: data.metadata
    });

    await newLog.save();
    console.log(`💾 Activity Log Saved: [${data.action}] for user [${data.userId}]`);
  } catch (err) {
    console.error("❌ Consumer DB Save Error:", err);
  }
});
// --- 4. الـ Route اللي بياخد من الـ Body ---
app.post('/send', async (req, res) => {
  try {
    const { msg } = req.body; 
    if (!msg) return res.status(400).send("Please provide 'msg' in body");

// إرسال كـ JSON String
    await kafkaConfig.produce("test-topic", [
      { value: msg } 
    ]);

    res.status(200).json({ status: "Sent to Kafka", data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// دي البوابة اللي المتصفح بيدخل منها لما تكتب localhost:3000
app.get('/', (req, res) => {
  // الـ res.send هي اللي بتبعت الكلام للمتصفح عشان يعرضه
  res.send(`🚀 Server is running on port ${port} and ready to receive Kafka messages!`);
});



app.post('/log-activity', async (req, res) => {
  try {
    const { userId, action, metadata } = req.body;

    // 1. تأكد إن البيانات كاملة
    if (!userId || !action) {
      return res.status(400).json({ error: "userId and action are required" });
    }

    // 2. تجهيز الـ Object اللي هيروح لكافكا
    const logData = {
      userId,
      action,
      metadata: metadata || {},
      timestamp: new Date()
    };

    // 3. إرسال لـ Kafka (الـ Producer)
    await kafkaConfig.produce("test-topic", [
      { value: JSON.stringify(logData) }
    ]);

    res.status(200).json({ 
      status: "Success", 
      message: "Activity event sent to Kafka",
      data: logData 
    });

  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




















app.listen(port, () => console.log(`🚀 Server on port ${port}`));