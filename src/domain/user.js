const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
   userId: String,
   action: String,
   metadata: Object,
   createdAt: {
     type: Date,
     default: Date.now,
     index: true
   }
});

ActivityLogSchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);





// const mongoose = require('mongoose');
// // تعريف شكل البيانات (Schema)
// const MsgSchema = new mongoose.Schema({
//   text: String,
//   receivedAt: { type: Date, default: Date.now }
// });
// module.exports = mongoose.model('Message', MsgSchema);

