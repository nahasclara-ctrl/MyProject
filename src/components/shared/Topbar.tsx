
import {useEffect} from "react";
import{Link, useNavigate} from "react-router-dom"
import { Button } from "../ui/button"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";


const Topbar = () => {
    const {mutate: signout, isSuccess} = useSignOutAccount();
    const navigate = useNavigate();
    const {user} = useUserContext();
    useEffect(() => {
        if(isSuccess) navigate(0);
         
        },[isSuccess]
    )
  return (
    <section className="topbar">
        <div className="flex-between py-4 px-5">
            <Link to="/" className="flex gap-3 items-center">
            <img 
            src="/assets/images/log0.png"
            alt="Logo"
            width={130}
            height={325}
            />
            </Link>

            <div className="flex gap-4">
                <Button variant="ghost" className="shad-button_ghost"
                onClick={() => signout()}>
                    <img src="/assets/icons/logout.svg" alt="Logout" />
                </Button>
                <Link to={`/profile/${user.id}`} className="flex gap-2 items-center">
                <img 
                src = {user.imageUrl || "/assets/images/profile-placeholder.svg"}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"/>
                </Link>
                </div>
        </div>
        </section>
  )
}

export default Topbar