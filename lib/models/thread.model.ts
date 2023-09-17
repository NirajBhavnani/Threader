import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
   text: { type: String, required: true },
   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
   createdAt: { type: Date, default: Date.now },
   parentId: { type: String },
   children: [
    {
        // It means 1 thread can have multiple threads as children
        type: mongoose.Schema.Types.ObjectId, ref: "Thread"
    }
   ]
});

// for the 1st time mongoose models are not going to exist, so we'll create it with second operation
// from 2nd time, models will be in DB, so 1st operation will be used
const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;