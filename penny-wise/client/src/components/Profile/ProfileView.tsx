import { User } from "@/types";

interface ProfileViewProps {
  user: User;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="col-span-4 sm:col-span-3 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-400">View your account information</p>
      </div>

      <div className="flex flex-col gap-6 border border-purple-950 rounded-sm p-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-purple-300">Name</label>
          <p className="text-lg text-gray-100 font-mono">{user.name}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-purple-300">Email</label>
          <p className="text-lg text-gray-100 font-mono">{user.email}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-purple-300">
            Member Since
          </label>
          <p className="text-lg text-gray-100 font-mono">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
