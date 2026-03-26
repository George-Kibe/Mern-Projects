import AvatarUpload from "@/components/Profile/AvatarUpload";
import DeleteAccountModal from "@/components/Profile/DeleteAccountModal";
import ExportDataButton from "@/components/Profile/ExportDataButton";
import ProfileEditForm from "@/components/Profile/ProfileEditForm";
import ProfileView from "@/components/Profile/ProfileView";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { getProfile, user, isLoading, error, deleteAccount } = useAuthStore();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  function handleEdit() {
    setMode("edit");
  }

  function handleCancel() {
    setMode("view");
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    await deleteAccount();
    setIsModalOpen(false);
    navigate({ to: "/" });
  }

  return (
    <main className="bg-slate-950 px-4 py-8 sm:px-8 sm:py-12 grid gap-8 grid-cols-1 md:grid-cols-2">
      {isLoading && (
        <div className="flex justify-center items-center py-24">
          <p className="text-gray-400 text-lg">Loading Profile ...</p>
        </div>
      )}

      {!isLoading && user && (
        <>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-700 rounded-sm text-red-400 max-w-2xl">
              {error}
            </div>
          )}
          <div>
            <AvatarUpload />
          </div>

          <div className="content-center lg:self-center lg:place-self-start">
            <ExportDataButton />
          </div>

          {mode === "view" ? (
            <div className="grid gap-4 grid-cols-4 sm:grid-cols-[150px_150px_150px_150px] md:col-start-1 md:col-end-2 md:grid-cols-3">
              <ProfileView user={user} />
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-purple-950 text-gray-100 rounded-sm hover:bg-purple-800 transition-colors cursor-pointer  font-medium row-start-2 col-span-2 sm:col-span-1"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-4 sm:grid-cols-[150px_150px_150px_150px]">
              <ProfileEditForm onCancel={handleCancel} />
            </div>
          )}

          <div className="border border-red-800 p-4 content-center lg:self-center lg:place-self-start">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all data. This action cannot
              be undone.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-sm flex items-center gap-2 transition-colors"
            >
              <Trash2 className="size-4" />
              Delete Account
            </button>
          </div>

          <DeleteAccountModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDeleteAccount}
            isDeleting={isDeleting}
          />
        </>
      )}
    </main>
  );
}
