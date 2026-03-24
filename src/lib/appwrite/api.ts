import { ImageGravity } from "appwrite";
import { ID, Query, Databases, Storage, Account, Avatars } from "appwrite";
import type { INewPost, INewUser, IUpdatePost } from "@/types";
import { appwriteConfig, account, databases, storage, avatars } from "./config";


// Create User Account

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });

    if (!newAccount) throw new Error("Account creation failed");
    await account.createEmailPasswordSession({
      email: user.email,
      password: user.password,  
    })
    const avatarUrl = avatars.getInitials({ name: user.name }).toString();
    
     await saveUserToDB({ //save the result
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: user.username,
    });

    return newAccount;
  } catch (error) {
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

    return currentUser.documents[0];
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
// ----------------------------
export function getFilePreview(
  fileId: string,
  width = 2000,
  height = 2000,
  gravity:ImageGravity=ImageGravity.Center,
  quality = 100
) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      width,
      height,
      gravity,
      quality
    );
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
  try {
    if (!post.file || post.file.length === 0)
      throw new Error("No file provided");

    // 1️⃣ Upload the file
    const uploaded = await uploadFile(post.file[0]);
    if (!uploaded) throw new Error("File upload failed");

    // 2️⃣ Get file preview URL
    const fileUrl = await getFilePreview(uploaded.$id);
    if (!fileUrl) {
      await deleteFile(uploaded.$id);
      throw new Error("Failed to get file preview");
    }

    // 3️⃣ Process tags
    const tags = post.tags?.replace(/\s/g, "").split(",") || [];

    // 4️⃣ Create post document
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploaded.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploaded.$id);
      throw new Error("Post creation failed");
    }

    return newPost;
  } catch (error) {
    console.error(error);
    return null;
  }
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

    if (!posts) throw new Error("No posts found");

    return posts;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw error;
  }
}
export async function likePost(postId: string, likesArray: string[]){
  try {
    const updatedPost  = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    )
    if(!updatedPost) throw new Error("Failed to like post");
    return updatedPost;

  }catch(error){
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
  }
}
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
    const tags = post.tags?.replace(/\s/g, "").split(",") || [];

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
export async function getInfinitePosts({
  pageParam = 0,
}: {
  pageParam?: number;
}) {
  try {
    const queries: any[] = [
      Query.orderDesc("$updatedAt"),
      Query.limit(10),
    ];

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw new Error("Failed to fetch posts");

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw new Error("Failed to search posts");

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
}