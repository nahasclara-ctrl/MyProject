import { getCurrentUser } from '@/lib/appwrite/api';
import type { IContextType, IUser } from '@/types';
import { createContext,useContext,useEffect,useState }  from 'react'
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER = {
   id:'',
   name:'',
   username:'',
   email:'',
   imageUrl:'',
   bio:'',
};
const INITIAL_STATE= {
  user:INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser:() => {},
  setIsAuthenticated:() =>{},
  checkAuthUser:async () => false as boolean,
}

const AuthContext=createContext<IContextType>(INITIAL_STATE);


const AuthProvider  = ({children}:{children:React.ReactNode}) => {
    const [user,setUser]=useState<IUser>(INITIAL_USER)
    const [isLoading,setIsLoading]=useState(false);
    const [isAuthenticated,setIsAuthenticated]=useState(false);

    const navigate=useNavigate();

    const checkAuthUser=async ()=>{
      setIsLoading(true); //i add this to set loading state to true when we start checking for the user, this will help us to show a loading state in the UI while we are checking for the user
        try{
            const currentAccount= await getCurrentUser();

            if(currentAccount){
               setUser({
                id: currentAccount.$id,
                name:currentAccount.name,
                username:currentAccount.username,
                email:currentAccount.email,
                imageUrl:currentAccount.imageUrl,
                bio:currentAccount.bio,
               save: currentAccount.save, //adding this
            })
          }
            setIsAuthenticated(true);

            return true;
         }

         return false;
        }catch(error){
         console.log(error);
         return false;
        }finally{
         setIsLoading(false);
        }

    };

   useEffect(() => {
  const checkUser = async () => {
    const cookiefallback = localStorage.getItem("cookieFallback");//i add this because appwrite session cookie is httpOnly and can't be accessed by js, so i set a fallback in localStorage to check if the user is logged in or not

     if (cookiefallback === "[]" || cookiefallback === null) {
       setIsLoading(false); //i add this 
      return; // just return, don't navigate
      //i remove the navigate (signin) because i want to check the user first and then navigate if the user is not authenticated, this is to prevent the navigate from being called before the checkAuthUser function is called and setting the isAuthenticated state to true
    }

    await checkAuthUser();
  };

  checkUser();
}, []);
    const value ={
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser
    }


  return (
    <AuthContext.Provider value={value}>
    {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
export const useUserContext = () =>useContext(AuthContext);