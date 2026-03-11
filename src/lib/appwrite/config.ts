import { Client, Account, Databases,Storage, Avatars } from "appwrite";

export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  usersCollectionId: import.meta.env.VITE_APPWRITE_users_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_posts_COLLECTION_ID, 
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID, //zabatet ho mn public next la vute 
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage=new Storage(client);
export const avatars = new Avatars(client);

export { client };
