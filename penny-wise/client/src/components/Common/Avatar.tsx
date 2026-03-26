import { getInitials } from "@/utils/getInitials";
import { User } from "lucide-react";

interface AvatarProps {
  userName: string;
  avatarFileName?: string;
}

export default function Avatar({ userName, avatarFileName }: AvatarProps) {
  const avatarUrl = avatarFileName
    ? `http://localhost:8000/uploads/avatars/${avatarFileName}`
    : null;

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${userName}'s avatar`}
          className={`rounded-full object-cover border-2 border-purple-500 size-12`}
        />
      ) : (
        <div
          className={`rounded-full p-2 bg-purple-950 border border-purple-500 flex items-center justify-center`}
        >
          {userName ? (
            <span className={` font-bold text-gray-100`}>
              {getInitials(userName)}
            </span>
          ) : (
            <User className={"text-gray-400"} />
          )}
        </div>
      )}
    </>
  );
}
