import { Client, Databases, Account, Storage, Avatars, ID } from "appwrite";

const ENV = {
  APPWRITE_URL: import.meta.env.VITE_APPWRITE_URL,
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  STORAGE_ID: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  SAVES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  POSTS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
  USERS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
  CIRCLES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_CIRCLES_COLLECTION_ID,
  CIRCLE_MESSAGES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_CIRCLE_MESSAGES_COLLECTION_ID,
} as const;

const validateEnv = () => {
  const missing: string[] = [];
  Object.entries(ENV).forEach(([key, value]) => {
    if (!value) missing.push(key);
  });
  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

validateEnv();

const client = new Client()
  .setEndpoint(ENV.APPWRITE_URL)
  .setProject(ENV.PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { client, databases, account, storage, avatars, ID };

export const appwriteConfig = {
  projectId: ENV.PROJECT_ID,
  databaseId: ENV.DATABASE_ID,
  storageId: ENV.STORAGE_ID,
  usersCollectionId: ENV.USERS_COLLECTION_ID,
  postCollectionId: ENV.POSTS_COLLECTION_ID,
  savesCollectionId: ENV.SAVES_COLLECTION_ID,
  messagesCollectionId: ENV.MESSAGES_COLLECTION_ID,
  circlesCollectionId: ENV.CIRCLES_COLLECTION_ID,
  circleMessagesCollectionId: ENV.CIRCLE_MESSAGES_COLLECTION_ID,
} as const;

export const CONFIG = {
  DATABASE_ID: ENV.DATABASE_ID,
  STORAGE_ID: ENV.STORAGE_ID,
  SAVES_COLLECTION_ID: ENV.SAVES_COLLECTION_ID,
  POSTS_COLLECTION_ID: ENV.POSTS_COLLECTION_ID,
  USERS_COLLECTION_ID: ENV.USERS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID: ENV.MESSAGES_COLLECTION_ID,
  CIRCLES_COLLECTION_ID: ENV.CIRCLES_COLLECTION_ID,
  CIRCLE_MESSAGES_COLLECTION_ID: ENV.CIRCLE_MESSAGES_COLLECTION_ID,
} as const;

export const debugConfig = () => {
  console.log("Appwrite Config:", {
    endpoint: ENV.APPWRITE_URL,
    projectId: ENV.PROJECT_ID?.slice(0, 8) + "...",
    databaseId: ENV.DATABASE_ID?.slice(0, 8) + "...",
  });
};