import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";

const AllUsers = () => {
  const { data: users, isLoading, isError } = useGetUsers();
  const { user: currentUser } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Something went wrong loading users.</p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        <ul className="user-grid">
          {users.documents.map((person: any) => (
            <li key={person.$id} className="flex-1 min-w-[200px] w-full">
              <Link
                to={`/profile/${person.$id}`}
                className="user-card"
              >
                <img
                  src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={person.name}
                  className="rounded-full w-14 h-14 object-cover"
                />
                <div className="flex-center flex-col gap-1">
                  <p className="base-medium text-light-1 text-center line-clamp-1">
                    {person.name}
                  </p>
                  <p className="small-regular text-light-3 text-center line-clamp-1">
                    @{person.username}
                  </p>
                </div>

                {currentUser.id !== person.$id && (
                  <button className="shad-button_primary px-5 py-2 text-sm">
                    Follow
                  </button>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AllUsers;