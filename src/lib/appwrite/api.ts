import { ID } from "appwrite";
import type { INewUser } from "@/types";
import { account, databases, avatars, appwriteConfig } from "./config";
import { Query } from "appwrite";

// ----------------------------
// Create User Account
// ----------------------------
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });

    if (!newAccount) throw new Error("Account creation failed");

    const avatarUrl = avatars
      .getInitials({
        name: user.name,
      })
      .toString();

    await saveUserToDB({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: user.username,
    });

    return newAccount;
  } catch (error) {
    console.log(error);
    throw error;
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
    const newUser = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.usersCollectionId,
      documentId: ID.unique(),
      data: user,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ----------------------------
// Sign In
// ----------------------------
export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    const session = await account.createEmailPasswordSession({
      email: user.email,
      password: user.password,
    });

    return session;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ----------------------------
// Get Current User
// ----------------------------
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if(!currentAccount) throw Error;

    const currentUser= await  databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('accountId',currentAccount.$id)]
    )
     if(!currentUser) throw Error;
     return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

// ----------------------------
// Logout
// ----------------------------
export async function signOutAccount() {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.log(error);
  }
}