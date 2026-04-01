import { useGetCurrentUser, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";


// Simple fallback if timeAgo doesn't exist in your utils
function formatTime(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

const Notifications = () => {
  const { user: currentUser } = useUserContext();
  const { data: allUsers, isLoading } = useGetUsers();
  const { data: me } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Build "who follows me" list from all users whose following includes my $id
  const followers =
    allUsers?.documents?.filter((u: any) =>
      u.following?.includes(currentUser.$id)
    ) ?? [];

  // Build "who liked my posts" from saves/likes on my posts
  const myPosts = me?.posts ?? [];
  type LikeNotif = { user: any; postId: string; postImg: string; caption: string };
  const likeNotifications: LikeNotif[] = [];

  myPosts.forEach((post: any) => {
    (post.likes ?? []).forEach((likerId: string) => {
      if (likerId === currentUser.$id) return; // skip self
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
    <div className="flex flex-1 flex-col gap-6 px-6 py-10 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src="/assets/icons/notification.svg"
          alt="notifications"
          width={30}
          height={30}
          className="invert-white"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <h2 className="h3-bold md:h2-bold">Notifications</h2>
      </div>

      {isEmpty ? (
        <div className="flex-center flex-col gap-4 mt-20">
          <p className="text-5xl">🔔</p>
          <p className="text-light-4 text-center">No notifications yet.</p>
          <p className="text-light-4 text-sm text-center">
            When people follow or like your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 w-full">
          {/* Follow notifications */}
          {followers.map((follower: any) => (
            <li
              key={`follow-${follower.$id}`}
              className="flex items-center gap-4 bg-dark-2 rounded-2xl px-5 py-4 hover:bg-dark-3 transition-colors"
            >
              <Link to={`/profile/${follower.$id}`}>
                <img
                  src={follower.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={follower.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              </Link>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-light-1 small-medium">
                  <Link
                    to={`/profile/${follower.$id}`}
                    className="font-semibold hover:underline"
                  >
                    {follower.name}
                  </Link>{" "}
                  <span className="text-light-3">started following you</span>
                </p>
                <p className="text-light-4 tiny-medium">@{follower.username}</p>
              </div>
              <span className="text-4xl">👤</span>
            </li>
          ))}

          {/* Like notifications */}
          {likeNotifications.map((notif, i) => (
            <li
              key={`like-${i}`}
              className="flex items-center gap-4 bg-dark-2 rounded-2xl px-5 py-4 hover:bg-dark-3 transition-colors"
            >
              <Link to={`/profile/${notif.user.$id}`}>
                <img
                  src={notif.user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={notif.user.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              </Link>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-light-1 small-medium">
                  <Link
                    to={`/profile/${notif.user.$id}`}
                    className="font-semibold hover:underline"
                  >
                    {notif.user.name}
                  </Link>{" "}
                  <span className="text-light-3">liked your post</span>
                </p>
                {notif.caption && (
                  <p className="text-light-4 tiny-medium truncate">
                    "{notif.caption}"
                  </p>
                )}
              </div>
              {notif.postImg && (
                <Link to={`/posts/${notif.postId}`}>
                  <img
                    src={notif.postImg}
                    alt="post"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                </Link>
              )}
              <span className="text-2xl">❤️</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;