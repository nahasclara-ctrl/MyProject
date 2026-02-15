import{ID} from 'appwrite';
import type { INewUser } from "@/types";
//to connect with appwrite functionalities
export async function createUserAccount(user:INewUser){
    try{
     const newAccount = await account.create(
        ID.unique(),
        user.email,
        user.password,
        user.name
     )

     return newAccount;
    }catch(error){
            console.log(error);
            return error;
    }
}
    
