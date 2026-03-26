import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ProfileEditFormProps {
  onCancel: () => void;
}

export default function ProfileEditForm({ onCancel }: ProfileEditFormProps) {
  const { user, updateProfile, isLoading, error } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const updateData: { name: string; email: string; password?: string } = {
      name,
      email,
    };

    if (password) {
      updateData.password = password;
    }

    await updateProfile(updateData);

    const { error: currentError } = useAuthStore.getState();

    if (!currentError) {
      onCancel();
    }
  }

  return (
    <div className="col-span-4 sm:col-span-3 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-100">Edit Profile</h1>
        <p className="text-gray-400">Update your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border-red-700 rounded-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 border border-purple-950 rounded-sm p-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="John Doe"
              className="px-4 py-3 bg-purple-950  rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="John@test.com"
              className="px-4 py-3 bg-purple-950 rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <p className="text-xs text-gray-500">
              Leave blank to keep current password
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="**********"
                className="w-full px-4 py-3 pr-12 bg-purple-950 rounded-sm text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-purple-950 text-gray-100 rounded-sm border border-purple-950 hover:border-purple-950 hover:bg-transparent transition font-medium"
          >
            {isLoading ? "Saving ..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3  text-gray-100 rounded-sm border border-purple-950 hover:bg-purple-950 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
