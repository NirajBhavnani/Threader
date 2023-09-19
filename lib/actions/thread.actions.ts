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

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Pagination: calculate the no. of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // condition for top-level threads
  const topLevel = { parentId: { $in: [null, undefined] } }

  // fetch the posts that have no parents (top-level threads)
  const postsQuery = Thread.find(topLevel)
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .populate({ path: "author", model: User })
    // recursive approach done for comments / children thread
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Thread.countDocuments(topLevel);

  const posts = await postsQuery.exec();

  // do we have a next page?
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}
