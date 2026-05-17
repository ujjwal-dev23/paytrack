import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { user, updateProfile, logout } from "../store/auth";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export default function ProfilePage() {
  const { route } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: Record<string, string> = {};

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;
    const reminder_template = formData.get("reminder_template") as string;

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (username !== user.value?.username) data.username = username;
    if (password) data.password = password;
    if (reminder_template !== user.value?.reminder_template)
      data.reminder_template = reminder_template;

    if (Object.keys(data).length === 0) {
      setError("No changes detected");
      setLoading(false);
      return;
    }

    try {
      await updateProfile(data);
      
      if (data.password) {
        // Automatically logout if password was changed
        alert("Password updated successfully. Please log in again with your new password.");
        await logout();
        return;
      }

      alert("Profile updated successfully!");
      route("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in max-w-2xl mx-auto space-y-8 duration-500">
      <header>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-text-muted text-sm">Manage your account and email preferences.</p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Account Information</h2>
            <Input
              label="Username"
              name="username"
              defaultValue={user.value?.username}
              required
            />
            <Input
              label="Email Address"
              value={user.value?.email}
              disabled
              title="Email cannot be changed"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="New Password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current"
              />
              <Input
                label="Confirm New Password"
                name="confirm_password"
                type="password"
                placeholder="Confirm your new password"
              />
            </div>
            <p className="text-[10px] text-text-muted italic">
              Note: You will be automatically logged out after changing your password.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Email Reminder Template</h2>
            <div className="w-full">
              <label className="label">Reminder Template</label>
              <textarea
                name="reminder_template"
                className="input-field min-h-[200px] font-mono text-sm leading-relaxed"
                defaultValue={user.value?.reminder_template || ""}
              />
              <p className="mt-2 text-[10px] text-text-muted leading-relaxed">
                Available placeholders: <code className="bg-primary/5 px-1 rounded text-primary">{`{customer_name}`}</code>,{" "}
                <code className="bg-primary/5 px-1 rounded text-primary">{`{description}`}</code>,{" "}
                <code className="bg-primary/5 px-1 rounded text-primary">{`{amount}`}</code>,{" "}
                <code className="bg-primary/5 px-1 rounded text-primary">{`{status}`}</code>,{" "}
                <code className="bg-primary/5 px-1 rounded text-primary">{`{due_date}`}</code>,{" "}
                <code className="bg-primary/5 px-1 rounded text-primary">{`{my_name}`}</code>.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-custom border border-red-100 bg-red-50 p-3">
              <p className="text-center text-xs text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-custom border border-green-100 bg-green-50 p-3">
              <p className="text-center text-xs text-green-600">Profile updated successfully!</p>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" className="w-full sm:w-auto px-8" isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
