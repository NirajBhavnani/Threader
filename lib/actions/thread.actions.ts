"use server";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    // Update user model
    // It's not only enough to create a thread, we have to specify who created it so pushing to specific user
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // It's going to make sure that the changes happen immediately
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}
