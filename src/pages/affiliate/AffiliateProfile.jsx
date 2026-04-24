import { useState } from "react";
import { toast } from "sonner";
import { Save, Lock } from "lucide-react";
import { authApi } from "../../api/client.js";
import { useAuth } from "../../context/useAuth.js";
import ErrorBanner from "../../components/ui/ErrorBanner.jsx";

export default function AffiliateProfile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ name, email: email || null });
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({ current_password: currentPw, new_password: newPw });
      toast.success("Password changed");
      setCurrentPw("");
      setNewPw("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-sub">Manage your account settings.</div>
        </div>
      </div>

      <div className="grid-2">
        <form className="card" onSubmit={saveProfile}>
          <div className="card-title">Personal details</div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group full">
              <label>Phone</label>
              <input value={user?.phone || ""} disabled />
              <div className="form-hint">Phone is used for login and cannot be changed here.</div>
            </div>
            <div className="form-group full">
              <label>Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" disabled={saving}>
              <Save size={14} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <form className="card" onSubmit={changePw}>
          <div className="card-title">
            <Lock size={16} /> Change password
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Current password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
            </div>
            <div className="form-group full">
              <label>New password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
              <div className="form-hint">Minimum 6 characters.</div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" disabled={pwSaving}>
              {pwSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
