import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  threads: [
    // this means one user can have multiple references to specific threads stored in the Database
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  members: [
    // this means multiple users can belong as members of specific community
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// for the 1st time mongoose models are not going to exist, so we'll create it with second operation
// from 2nd time, models will be in DB, so 1st operation will be used
const Community = mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;
