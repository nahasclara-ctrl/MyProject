import { useGetCurrentUser, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";

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

const Notifications = () => {
  const { user: currentUser } = useUserContext();
  const { data: allUsers, isLoading } = useGetUsers();
  const { data: me } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: P[50] }}>
        <Loader />
      </div>
    );
  }

  const followers =
    allUsers?.documents?.filter((u: any) =>
      u.following?.includes(currentUser.$id)
    ) ?? [];

  const myPosts = me?.posts ?? [];

  const likeNotifications: any[] = [];

  myPosts.forEach((post: any) => {
    (post.likes ?? []).forEach((likerId: string) => {
      if (likerId === currentUser.$id) return;

      const liker = allUsers?.documents?.find((u: any) => u.$id === likerId);

      if (liker) {
        likeNotifications.push({
          user: liker,
          postId: post.$id,
          postImg: post.imageUrl,
          caption: post.caption,
        });
      }
    });
  });

  const isEmpty = followers.length === 0 && likeNotifications.length === 0;

  return (
    <div
      className="min-h-screen w-full max-w-2xl mx-auto px-4 py-8"
      style={{ background: `linear-gradient(180deg, ${P[50]}, #ffffff)` }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🔔</span>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: P[700] }}
        >
          Notifications
        </h2>
      </div>

      {/* EMPTY STATE */}
      {isEmpty ? (
        <div
          className="text-center mt-20 p-10 rounded-2xl border"
          style={{ backgroundColor: P[50], borderColor: P[200] }}
        >
          <p className="text-4xl mb-2">🔔</p>
          <p className="font-semibold" style={{ color: P[600] }}>
            No notifications yet
          </p>
          <p className="text-sm mt-1" style={{ color: P[400] }}>
            Likes and follows will appear here
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">

          {/* FOLLOW NOTIFICATIONS */}
          {followers.map((follower: any) => (
            <li
              key={`follow-${follower.$id}`}
              className="flex items-center gap-3 p-4 rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: P[200],
              }}
            >
              <Link to={`/profile/${follower.$id}`}>
                <img
                  src={
                    follower.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ border: `1px solid ${P[200]}` }}
                />
              </Link>

              <div className="flex-1">
                <p className="text-sm">
                  <Link
                    to={`/profile/${follower.$id}`}
                    style={{
                      color: P[600],
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {follower.name}
                  </Link>{" "}
                  <span style={{ color: P[500] }}>
                    started following you
                  </span>
                </p>

                <p className="text-xs" style={{ color: P[400] }}>
                  @{follower.username}
                </p>
              </div>

              <span style={{ color: P[400] }}>👤</span>
            </li>
          ))}

          {/* LIKE NOTIFICATIONS */}
          {likeNotifications.map((notif, i) => (
            <li
              key={`like-${i}`}
              className="flex items-center gap-3 p-4 rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: P[200],
              }}
            >
              <Link to={`/profile/${notif.user.$id}`}>
                <img
                  src={
                    notif.user.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ border: `1px solid ${P[200]}` }}
                />
              </Link>

              <div className="flex-1">
                <p className="text-sm">
                  <Link
                    to={`/profile/${notif.user.$id}`}
                    style={{
                      color: P[600],
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {notif.user.name}
                  </Link>{" "}
                  <span style={{ color: P[500] }}>liked your post</span>
                </p>

                {notif.caption && (
                  <p className="text-xs mt-1" style={{ color: P[400] }}>
                    "{notif.caption}"
                  </p>
                )}
              </div>

              {notif.postImg && (
                <Link to={`/posts/${notif.postId}`}>
                  <img
                    src={notif.postImg}
                    className="w-11 h-11 rounded-xl object-cover"
                    style={{ border: `1px solid ${P[200]}` }}
                  />
                </Link>
              )}

              <span style={{ color: P[500] }}>❤️</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;