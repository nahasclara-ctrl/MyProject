import { ID, Query } from "appwrite";
import type { INewPost, INewUser, IUpdatePost } from "@/types";
import { appwriteConfig, account, databases, storage, avatars } from "./config";


// Create User Account
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    await account.deleteSessions();

    await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    const avatarUrl = avatars.getInitials(user.name);

    // ✅ ADD BIO HERE
    await saveUserToDB({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: user.username,
      bio: user.bio || "", 
    });

    return newAccount;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ----------------------------
// Save User to Database
// ----------------------------
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
  bio?: string;
 
}) {
  try {
    //console.log("DB ID:", appwriteConfig.databaseId);
    //console.log("Collection ID:", appwriteConfig.usersCollectionId);
    //console.log("User Data:", user);
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.error("saveUserToDb Failed:", error);
    throw error;
    //hon badal return null hattayna ha la nshuf shu lmshkle le ma aam taaml run 
  }
}

// ----------------------------
// Sign In
// ----------------------------
export async function signInAccount(user: { email: string; password: string }) {
  try {
    try{
    await account.deleteSession("current");// // Clear existing session before signing in
  } catch (e) {
  }
  const session = await account.createEmailPasswordSession({
    email: user.email,
    password: user.password,
  });
  return session;
  } catch (error) {
    console.error(error);
    return null;
  }
}
// ----------------------------
// Get Current User
// ----------------------------
// REPLACE your getCurrentUser function in src/lib/appwrite/api.ts with this:


export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No account found");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("User not found");

    const user = currentUser.documents[0];

    // Populate saves
    if (user.save && user.save.length > 0) {
      const populatedSaves = await Promise.all(
        user.save.map(async (saveDoc: any) => {
          if (saveDoc.post && typeof saveDoc.post === "object" && saveDoc.post.$id) {
            return saveDoc;
          }
          try {
            const postId = typeof saveDoc.post === "string" ? saveDoc.post : saveDoc.post?.$id;
            if (!postId) return saveDoc;
            const post = await databases.getDocument(
              appwriteConfig.databaseId,
              appwriteConfig.postCollectionId,
              postId
            );
            return { ...saveDoc, post };
          } catch {
            return saveDoc;
          }
        })
      );
      user.save = populatedSaves;
    }

    // ── NEW: fetch this user's posts with their likes ──────────
    const userPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("creator", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]
    );
    user.posts = userPosts.documents;
    // ───────────────────────────────────────────────────────────

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}
// ----------------------------
// Logout
// ----------------------------
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ----------------------------
// Upload File
// ----------------------------
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.error(error);
    return null;
  }
}


// ----------------------------
// Get File Preview
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId
    ).toString();
    return fileUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}
// ----------------------------
// Delete File
// ----------------------------
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

// ----------------------------
// Create Post
// ----------------------------
export async function createPost(post: INewPost) {
  if (!post.file || post.file.length === 0) throw new Error("No file provided");

  // 1️⃣ Upload first file (you can loop for multiple)
  const uploaded = await uploadFile(post.file[0]); 
  if (!uploaded) throw new Error("File upload failed");

  // 2️⃣ Get preview URL
  const fileUrl = storage.getFileView(
    appwriteConfig.storageId,
    uploaded.$id
  ).toString();
  if (!fileUrl) {
    await deleteFile(uploaded.$id);
    throw new Error("Failed to get file preview");
  }

  // 3️⃣ Create post document
  const newPostDoc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    ID.unique(),
    {
      creator: post.userId,
      caption: post.caption,
      imageUrl: fileUrl,
      imageId: uploaded.$id,
      location: post.location || "",
      tags: post.tags || [],
    }
  );

  return newPostDoc;
}
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.orderDesc("$createdAt"),
        Query.limit(20),
      ]
    );

    // For each post, fetch the creator info manually
    const postsWithCreators = await Promise.all(
      posts.documents.map(async (post) => {
        const creator = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          post.creator
        );
        return { ...post, creator };
      })
    );

    return postsWithCreators;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw error;
  }
}

export async function likePost(postId: string, likesArray: string[], currentUser: { $id: string; name: string; imageUrl: string }) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray }
    );
    if (!updatedPost) throw new Error("Failed to like post");

    // Fetch post to get creator + image info
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    const creatorId = typeof post.creator === "string" ? post.creator : post.creator?.$id;

    // If liking (user is in new array) → create notification
    // If unliking (user removed from array) → delete notification
    if (likesArray.includes(currentUser.$id)) {
      await createNotification({
        receiverId: creatorId,
        senderId: currentUser.$id,
        type: "like",
        postId: postId,
        postImg: post.imageUrl,
        caption: post.caption,
        senderName: currentUser.name,
        senderImg: currentUser.imageUrl,
      });
    } else {
      await deleteLikeNotification(currentUser.$id, postId);
    }

    return updatedPost;
  } catch (error) {
    console.error("Error liking post:", error);
  }
}
export async function savePost(postId: string,userId:string){
  try {
    const updatedPost  = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
    {
      user: userId,
      post:postId,
    }
  );
  if(!updatedPost) throw new Error("Failed to save Post")
   return updatedPost;

  }catch(error){
    console.error("Error saving post:", error);
    return null; //
  }
}

export const getSavedPosts = async (userId: string) => {
  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    [Query.equal("user", userId)]
  );

  return response.documents;
};
export async function deleteSavedPost(savedRecordId: string,){
  try {
    const statusCode  = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId,
    )
    if(!statusCode) throw new Error;
    return {status: "ok"};

  }catch(error){
    console.error("Error unsaving post:", error);
  }
}
export function checkIsLiked(likeList: string[], userId: string){
  return likeList.includes(userId);
}

export async function getPostById(postId: string){
  try{
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )
    return post;
  }catch(error){
  }
}
export async function updatePost(post:IUpdatePost) {
  const hasFileToUpdate=post.file.length >0;
  try {
    let image={
      imageUrl:post.imageUrl,
      imageId:post.imageId,
    }
    if(hasFileToUpdate){
      // 1️⃣ Upload the file
      const uploaded = await uploadFile(post.file[0]);
    if (!uploaded) throw new Error("File upload failed");

    // 2️⃣ Get file preview URL
    const fileUrl = await getFilePreview(uploaded.$id);
    if (!fileUrl) {
      await deleteFile(uploaded.$id);
      throw new Error("Failed to get file preview");
    }
    if (!post.file || post.file.length === 0)
      throw new Error("No file provided");
    

    image={ ...image,imageUrl: fileUrl,imageId:uploaded.$id}

  }  
  
    // 3️⃣ Process tags
    const tags = post.tags || [];

    // 4️⃣ Create post document
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw new Error("Post creation failed");
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function deletePost(postId:string, imageId:string){
  if(!postId || !imageId) throw Error;

  try{
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )
    return { status:'ok'}
  }catch(error){
    console.log(error)
  }
}
// api.ts

export async function getInfinitePosts({
  pageParam,
  excludeUserId,
}: {
  pageParam: string | null;
  excludeUserId?: string;
}) {
  const queries: any[] = [
    Query.orderDesc("$createdAt"),
    Query.limit(10),
  ];

  if (pageParam) queries.push(Query.cursorAfter(pageParam));

  // exclude only the current logged-in user's posts
  if (excludeUserId) {
    queries.push(Query.notEqual("creator", excludeUserId));
  }

  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    queries
  );

  const postsWithCreators = await Promise.all(
    posts.documents.map(async (post) => {
      try {
        const creator = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          post.creator
        );
        return { ...post, creator };
      } catch {
        return post;
      }
    })
  );

  return { ...posts, documents: postsWithCreators };
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw new Error("Failed to search posts");

    // Same enrichment — search results also need the creator object
    const postsWithCreators = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          const creator = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            post.creator
          );
          return { ...post, creator };
        } catch {
          return post;
        }
      })
    );

    return { ...posts, documents: postsWithCreators };
  } catch (error) {
    console.log(error);
    throw error;
  }
}




export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId
    );
    return user;
  } catch (error) {
    console.error("getUserById failed:", error);
    return null;
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("creator", userId),
        Query.orderDesc("$createdAt"),
      ]
    );
    return posts;
  } catch (error) {
    console.error("getUserPosts failed:", error);
    return null;
  }
}

export async function getUsers(limit?: number) {
  try {
    const queries: any[] = [Query.orderDesc("$createdAt")];
    if (limit) queries.push(Query.limit(limit));

    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      queries
    );
    return users;
  } catch (error) {
    console.error("getUsers failed:", error);
    return null;
  }
}
// ADD THIS FUNCTION to your api.ts file (src/lib/appwrite/api.ts)
// This fetches posts only from users you follow, for the Home feed

export async function getFollowingPosts({
  pageParam,
  followingIds = [],
}: {
  pageParam: string | null;
  followingIds: string[];
}) {
  if (followingIds.length === 0) {
    return { documents: [], total: 0 };
  }

  const queries: any[] = [
    Query.orderDesc("$createdAt"),
    Query.limit(10),
  ];

  if (pageParam) queries.push(Query.cursorAfter(pageParam));

  queries.push(Query.equal("creator", followingIds));

  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    queries
  );

  // I  ADD THIS PART
  const postsWithCreators = await Promise.all(
    posts.documents.map(async (post) => {
      const creator = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        post.creator
      );

      return { ...post, creator };
    })
  );

  return {
    ...posts,
    documents: postsWithCreators,
  };
}
export async function searchUsers(searchTerm: string) {
  try {
    const byName = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.search("name", searchTerm)]
    );
    const byUsername = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.search("username", searchTerm)]
    );

    // Merge and deduplicate
    const merged = [...byName.documents];
    byUsername.documents.forEach((u) => {
      if (!merged.find((m) => m.$id === u.$id)) merged.push(u);
    });

    return { documents: merged, total: merged.length };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getUsersByIds(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return [];

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("$id", ids)]
    );

    return res.documents; //  must be documents
  } catch (error) {
    console.error("getUsersByIds failed:", error);
    return [];
  }
}
export async function updateUserProfile({ userId, name, bio }: any) {
  try {
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      {
        name,
        bio,
      }
    );
  } catch (error) {
    console.error("updateUserProfile error:", error);
    throw error;
  }
}
export async function changePassword({
  currentPassword,
  newPassword,
}: any) {
  return await account.updatePassword(newPassword, currentPassword);
}
export async function deleteUserAccount(userId: string) {
  try {
    // Delete all sessions first (logs out everywhere)
    await account.deleteSessions();
  } catch (e) {
    // ignore if already gone
  }
  // Appwrite client SDK cannot delete the auth user itself —
  // only the Server SDK (with API key) can. So we delete the
  // DB document and clear sessions. For full auth deletion
  // you still need the Appwrite Function (as your comment says).
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    userId
  );
}
// ── Create a notification ──────────────────────────────────────
export async function createNotification({
  receiverId, senderId, type, postId, postImg, caption, senderName, senderImg,
}: {
  receiverId: string; senderId: string; type: "like" | "follow";
  postId?: string; postImg?: string; caption?: string;
  senderName: string; senderImg?: string;
}) {
  // Don't notify yourself
  if (receiverId === senderId) return;

  // Avoid duplicate like notifications
  if (type === "like") {
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("receiverId", receiverId),
        Query.equal("senderId", senderId),
        Query.equal("type", "like"),
        Query.equal("postId", postId ?? ""),
      ]
    );
    if (existing.documents.length > 0) return;
  }

  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    ID.unique(),
    { receiverId, senderId, type, postId: postId ?? "", postImg: postImg ?? "", caption: caption ?? "", senderName, senderImg: senderImg ?? "", read: false }
  );
}

// ── Delete a like notification (on unlike) ────────────────────
export async function deleteLikeNotification(senderId: string, postId: string) {
  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    [
      Query.equal("senderId", senderId),
      Query.equal("type", "like"),
      Query.equal("postId", postId),
    ]
  );
  for (const doc of existing.documents) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      doc.$id
    );
  }
}

// ── Get notifications for a user ──────────────────────────────
export async function getNotifications(
  userId: string,
  limit: number = 20,
  cursor: string | null = null
) {
  const queries: any[] = [
    Query.equal("receiverId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];
 
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }
 
  return await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    queries
  );
}

// ── Mark all as read ──────────────────────────────────────────
export async function markNotificationsRead(userId: string) {
  const unread = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    [Query.equal("receiverId", userId), Query.equal("read", false)]
  );
  await Promise.all(
    unread.documents.map((doc) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        doc.$id,
        { read: true }
      )
    )
  );
}
// ── Add these functions to your api.ts ────────────────────────

// Get count of unread messages for a user (from all senders)
export async function getUnreadMessageCounts(userId: string): Promise<Record<string, number>> {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("receiverId", userId),
        Query.equal("read", false),
        Query.limit(200),
      ]
    );
    const counts: Record<string, number> = {};
    for (const doc of res.documents) {
      counts[doc.senderId] = (counts[doc.senderId] ?? 0) + 1;
    }
    return counts;
  } catch (error) {
    console.error("getUnreadMessageCounts failed:", error);
    return {}; // ← return empty instead of crashing
  }
}

export async function markMessagesRead(senderId: string, receiverId: string) {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("senderId", senderId),
        Query.equal("receiverId", receiverId),
        Query.equal("read", false),
        Query.limit(200),
      ]
    );
    await Promise.all(
      res.documents.map((doc) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.messagesCollectionId,
          doc.$id,
          { read: true }
        )
      )
    );
  } catch (error) {
    console.error("markMessagesRead failed:", error);
  }
}

// Get the latest message between two users (for conversation preview)
export async function getLatestMessage(userId1: string, userId2: string) {
  const [res1, res2] = await Promise.all([
    databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("senderId", userId1),
        Query.equal("receiverId", userId2),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    ),
    databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("senderId", userId2),
        Query.equal("receiverId", userId1),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    ),
  ]);

  const both = [...res1.documents, ...res2.documents];
  if (both.length === 0) return null;
  both.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
  return both[0];
}