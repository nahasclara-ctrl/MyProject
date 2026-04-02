import type { Models } from "node_modules/appwrite/types/client";

export type IContextType={
  user:IUser;
  isLoading:boolean;
  setUser:React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated:boolean;
  setIsAuthenticated:React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser:() => Promise<boolean>;
  logout: () => void;
};


export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string[];

};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];
  location?: string;
  tags?: string[];
};

export type IUser = {
  id?: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  save: SavedPost[];
  $id: string;
  followers?: string[];
  following?: string[];
};
export type SavedPost= Models.Document & {
  post: Post;
}
export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type AppwritePost = Models.Document & {
  userId: string;       // who created the post
  caption: string;
  tags: string[];
  imageUrl: string;
  imageId: string;
  location?: string;

  file?: File[];

};

export type Post = AppwritePost & {
  creator?: {           // optional, fetched later for display
    $id: string;
    name: string;
    imageUrl: string;
  };
  likes?: string[];
};

