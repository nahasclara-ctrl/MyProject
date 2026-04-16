import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const Topbar = () => {
  const { mutate: signout, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <section
      className="topbar"
      style={{
        backgroundColor: "#fff",
        borderBottom: `1px solid ${P[200]}`,
      }}
    >
      <div className="flex-between py-4 px-5">

        {/* LOGO */}
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/log0.png"
            alt="Logo"
            width={130}
            height={325}
          />
        </Link>

        {/* ACTIONS */}
        <div className="flex gap-4 items-center">

          {/* LOGOUT */}
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signout()}
            style={{
              color: P[600],
            }}
          >
            <img
              src="/assets/icons/logout.svg"
              alt="Logout"
              style={{
                filter: "grayscale(100%) opacity(0.6)",
              }}
            />
          </Button>

          {/* PROFILE */}
          <Link to={`/profile/${user.id}`} className="flex gap-2 items-center">
            <img
              src={
                user.imageUrl ||
                "/assets/images/profile-placeholder.svg"
              }
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
              style={{
                border: `1px solid ${P[200]}`,
              }}
            />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default Topbar;