import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    threads: [
        // this means one user can have multiple references to specific threads stored in the Database
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community"
        }
    ]
});

// for the 1st time mongoose models are not going to exist, so we'll create it with second operation
// from 2nd time, models will be in DB, so 1st operation will be used
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;