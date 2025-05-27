import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MessageSquareIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-3 sm:p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="avatar size-10 sm:size-12">
            <img src={friend.profilePic} alt={friend.fullName} className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{friend.fullName}</h3>
            {friend.location && (
              <p className="text-xs opacity-70 truncate">{friend.location}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-[10px] sm:text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="hidden sm:inline">Native:</span> {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-[10px] sm:text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="hidden sm:inline">Learning:</span> {friend.learningLanguage}
          </span>
        </div>

        <Link 
          to={`/chat/${friend._id}`} 
          className="btn btn-outline btn-sm sm:btn-md w-full flex items-center justify-center gap-2"
        >
          <MessageSquareIcon className="size-4" />
          <span>Message</span>
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
