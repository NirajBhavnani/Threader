"use server";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";

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

    // Find the community if any
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update user model
    // It's not only enough to create a thread, we have to specify who created it so pushing to specific user
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

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
  const topLevel = { parentId: { $in: [null, undefined] } };

  // fetch the posts that have no parents (top-level threads)
  const postsQuery = Thread.find(topLevel)
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "community",
      model: Community,
    })
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

export async function fetchThreadById(id: string) {
  connectToDB();

  // multi-level commenting functionality
  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children",
        // each child thread gets populated with the author of that specific comment
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          // populate thread comment itself
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // find the original thread by it's ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // save the new thread to DB
    const savedCommentThread = await commentThread.save();

    // Update the original thread to include the new comment
    originalThread.children.push(savedCommentThread._id);

    // save the original thread
    await originalThread.save();

    // to show instantly
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}
