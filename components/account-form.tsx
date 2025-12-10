"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/server";

export default function AccountForm({ user, profile }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase("profiles").update({
      full_name: fullName,
      updated_at: new Date().toISOString()
    }).eq("id", user.id);

    if (error) setMessage("Error updating profile");
    else setMessage("Saved!");

    setLoading(false);
  };

  const updatePassword = async () => {
    const newPass = prompt("Enter new password (min 6 chars)");
    if (!newPass) return;

    const { error } = await supabase({ password: newPass });

    setMessage(error ? "Password update failed" : "Password updated!");
  };

  return (
    <form onSubmit={updateProfile} className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Account Settings</h2>

      <div>
        <label>Email (read only)</label>
        <input
          className="border p-2 w-full"
          value={user.email}
          disabled
        />
      </div>

      <div>
        <label>Full Name</label>
        <input
          className="border p-2 w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        className="bg-gray-700 text-white px-4 py-2 rounded ml-2"
        onClick={updatePassword}
      >
        Change Password
      </button>

      {message && <p className="text-green-600 mt-4">{message}</p>}
    </form>
  );
}
