import { ID, Query } from "appwrite";
import { databases, CONFIG, client } from "./config";

// ============================================================
// TYPES
// ============================================================

export interface Circle {
  $id: string;
  mood: string;
  members: string[];
  maxMembers: number;
  currentMembers: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Message {
  $id: string;
  circleId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export type MoodType = "happy" | "sad" | "stressed" | "bored" | "chill";

// ============================================================
// ERROR HANDLING UTILITIES
// ============================================================

export class AppwriteError extends Error {
  public code: string;
  public originalError?: unknown;

  constructor(code: string, message: string, originalError?: unknown) {
    super(message);
    this.name = "AppwriteError";
    this.code = code;
    this.originalError = originalError;
  }
}

function parseAppwriteError(error: unknown): { code: string; message: string } {
  if (error instanceof Error) {
    const errorStr = error.message;

    if (errorStr.includes("CORS") || errorStr.includes("cors")) {
      return {
        code: "CORS_ERROR",
        message: "CORS error - Check Appwrite console > Settings > Allowed origins. Add your domain (e.g., http://localhost:5173)",
      };
    }

    if (errorStr.includes("project") || errorStr.includes("401")) {
      return {
        code: "INVALID_PROJECT",
        message: "Invalid Project ID or URL - Check your .env variables",
      };
    }

    if (errorStr.includes("collection") || errorStr.includes("404")) {
      return {
        code: "INVALID_COLLECTION",
        message: "Collection not found - Check CIRCLES_COLLECTION_ID and CIRCLE_MESSAGES_COLLECTION_ID in .env",
      };
    }

    if (errorStr.includes("database")) {
      return {
        code: "INVALID_DATABASE",
        message: "Database not found - Check VITE_APPWRITE_DATABASE_ID in .env",
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: errorStr,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
  };
}

// ============================================================
// JOIN OR CREATE CIRCLE
// ============================================================

export async function joinCircle(userId: string, mood: MoodType): Promise<Circle> {
  try {
    console.log(`📍 Joining circle for mood: ${mood}`);
    console.log("🔍 CONFIG values:", {
      DATABASE_ID: CONFIG.DATABASE_ID,
      CIRCLES_COLLECTION_ID: CONFIG.CIRCLES_COLLECTION_ID,
      CIRCLE_MESSAGES_COLLECTION_ID: CONFIG.CIRCLE_MESSAGES_COLLECTION_ID,
    });

    const res = await databases.listDocuments(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLES_COLLECTION_ID,
      [
        Query.equal("mood", mood),
        Query.equal("isActive", true),
        Query.lessThan("currentMembers", 5),
        Query.orderDesc("$createdAt"),
        Query.limit(10),
      ]
    );

    let circle: Circle;

    if (res.documents.length > 0) {
      const randomIndex = Math.floor(Math.random() * res.documents.length);
      const existingCircle = res.documents[randomIndex] as unknown as Circle;

      console.log(`✅ Found existing circle: ${existingCircle.$id}`);

      if (existingCircle.members.includes(userId)) {
        console.warn(`⚠️  User already in circle ${existingCircle.$id}`);
        return existingCircle;
      }

      const updated = await databases.updateDocument(
        CONFIG.DATABASE_ID,
        CONFIG.CIRCLES_COLLECTION_ID,
        existingCircle.$id,
        {
          members: [...existingCircle.members, userId],
          currentMembers: existingCircle.currentMembers + 1,
        }
      );

      circle = updated as unknown as Circle;
    } else {
      console.log(`🆕 No circles available, creating new one`);

      const created = await databases.createDocument(
        CONFIG.DATABASE_ID,
        CONFIG.CIRCLES_COLLECTION_ID,
        ID.unique(),
        {
          mood,
          members: [userId],
          maxMembers: 5,
          currentMembers: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: userId,
        }
      );

      circle = created as unknown as Circle;
    }

    console.log(`🎯 Successfully joined/created circle: ${circle.$id}`);
    return circle;
  } catch (error) {
    const { code, message } = parseAppwriteError(error);
    console.error(`❌ joinCircle failed: ${code} - ${message}`, error);
    throw new AppwriteError(code, message, error);
  }
}

// ============================================================
// GET CIRCLE MESSAGES
// ============================================================

export async function getCircleMessages(circleId: string): Promise<Message[]> {
  try {
    const res = await databases.listDocuments(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLE_MESSAGES_COLLECTION_ID,
      [
        Query.equal("circleId", circleId),
        Query.orderAsc("createdAt"),
        Query.limit(100),
      ]
    );

    return res.documents as unknown as Message[];
  } catch (error) {
    const { code, message } = parseAppwriteError(error);
    console.error(`❌ getCircleMessages failed: ${code}`, error);
    throw new AppwriteError(code, message, error);
  }
}

// ============================================================
// SEND MESSAGE
// ============================================================

export async function sendCircleMessage(
  circleId: string,
  userId: string,
  senderName: string,
  content: string
): Promise<Message> {
  try {
    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    const message = await databases.createDocument(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLE_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        circleId,
        senderId: userId,
        senderName,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
    );

    console.log(`💬 Message sent to circle ${circleId}`);
    return message as unknown as Message;
  } catch (error) {
    const { code, message } = parseAppwriteError(error);
    console.error(`❌ sendCircleMessage failed: ${code}`, error);
    throw new AppwriteError(code, message, error);
  }
}

// ============================================================
// SUBSCRIBE TO REAL-TIME MESSAGES
// ============================================================

export function subscribeToCircleMessages(
  circleId: string,
  onMessage: (message: Message) => void
): () => void {
  console.log(`📡 Subscribing to circle: ${circleId}`);

  const unsubscribe = client.subscribe(
    `databases.${CONFIG.DATABASE_ID}.collections.${CONFIG.CIRCLE_MESSAGES_COLLECTION_ID}.documents`,
    (event: any) => {
      if (!event.events?.some((e: string) => e.includes("create"))) {
        return;
      }

      const message = event.payload as Message;

      if (message.circleId === circleId) {
        console.log(`💭 Real-time message received:`, message);
        onMessage(message);
      }
    }
  );

  return unsubscribe;
}

// ============================================================
// LEAVE CIRCLE
// ============================================================

export async function leaveCircle(circleId: string, userId: string): Promise<boolean> {
  try {
    const circle = (await databases.getDocument(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLES_COLLECTION_ID,
      circleId
    )) as unknown as Circle;

    const newMembers = circle.members.filter((id) => id !== userId);
    const newMemberCount = Math.max(0, circle.currentMembers - 1);

    await databases.updateDocument(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLES_COLLECTION_ID,
      circleId,
      {
        members: newMembers,
        currentMembers: newMemberCount,
        isActive: newMembers.length > 0,
      }
    );

    console.log(`👋 User ${userId} left circle ${circleId}`);
    return true;
  } catch (error) {
    const { code, message } = parseAppwriteError(error);
    console.error(`❌ leaveCircle failed: ${code}`, error);
    throw new AppwriteError(code, message, error);
  }
}

// ============================================================
// GET CIRCLE BY ID
// ============================================================

export async function getCircleById(circleId: string): Promise<Circle> {
  try {
    const circle = await databases.getDocument(
      CONFIG.DATABASE_ID,
      CONFIG.CIRCLES_COLLECTION_ID,
      circleId
    );

    return circle as unknown as Circle;
  } catch (error) {
    const { code, message } = parseAppwriteError(error);
    console.error(`❌ getCircleById failed: ${code}`, error);
    throw new AppwriteError(code, message, error);
  }
}