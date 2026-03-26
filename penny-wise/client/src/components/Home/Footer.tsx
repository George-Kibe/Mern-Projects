import { DollarSign } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-b border-slate-700 p-4 sm:px-8 sm:py-8 2xl:border-none 2xl:bg-transparent">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 2xl:py-8 2xl:border-t 2xl:border-purple-950">
        <div className="flex items-center gap-2">
          <DollarSign className="size-6 text-purple-400" />
          <span className="text-lg font-bold text-gray-100">PennyWise</span>
        </div>

        <p className="text-sm text-gray-400">
          © 2026 PennyWise. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
