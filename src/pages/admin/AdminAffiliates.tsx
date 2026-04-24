import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, KeyRound, Search } from "lucide-react";
import { adminApi, usersApi } from "../../api/client";
import { fmt, fmtDate, statusBadgeClass } from "../../utils/helpers";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Empty from "../../components/ui/Empty";
import ErrorBanner from "../../components/ui/ErrorBanner";

const PLANS = ["BASIC", "PRO", "ENTERPRISE"];
const STATUSES = ["ACTIVE", "PENDING", "EXPIRED", "SUSPENDED"];

const initialForm = { name: "", phone: "", email: "", password: "", plan: "BASIC" };

export default function AdminAffiliates() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await adminApi.affiliates());
      setErr("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.phone?.includes(q) ||
      r.user?.email?.toLowerCase().includes(q)
    );
  });

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createAffiliate(form);
      toast.success("Affiliate created");
      setAddOpen(false);
      setForm(initialForm);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateAffiliate(editing.id, {
        plan: editing.plan,
        status: editing.status,
        notes: editing.notes || null,
      });
      await usersApi.update(editing.user.id, {
        name: editing.user.name,
        email: editing.user.email || null,
        active: editing.user.active,
      });
      toast.success("Affiliate updated");
      setEditing(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const doReset = async (pw) => {
    setSaving(true);
    try {
      await usersApi.resetPassword(resetting.user.id, pw);
      toast.success("Password reset");
      setResetting(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setSaving(true);
    try {
      await adminApi.deleteAffiliate(deleting.id);
      toast.success("Affiliate deleted");
      setDeleting(null);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Affiliates</div>
          <div className="page-sub">Manage affiliates, their plans, and status.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add affiliate
        </button>
      </div>

      <ErrorBanner message={err} onDismiss={() => setErr("")} />

      <div className="card">
        <div className="card-header">
          <div className="search-input" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by name, phone, or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted">{filtered.length} of {rows.length}</div>
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <Empty title="No affiliates" description="Add your first affiliate to get started." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Events</th>
                  <th>Revenue</th>
                  <th>Joined</th>
                  <th className="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.user?.name}</div>
                      {a.notes && <div className="text-xs text-muted">{a.notes}</div>}
                    </td>
                    <td>{a.user?.phone}</td>
                    <td>{a.user?.email || "—"}</td>
                    <td>
                      <span className="badge badge-plan">{a.plan}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(a.status)}`}>{a.status}</span>
                    </td>
                    <td>{a._count?.events || 0}</td>
                    <td className="amount-tag">{fmt(a.revenue || 0)}</td>
                    <td>{fmtDate(a.join_date)}</td>
                    <td className="num">
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ ...a, user: { ...a.user } })} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setResetting(a)} title="Reset password">
                          <KeyRound size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => setDeleting(a)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add new affiliate"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="add-aff-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create affiliate"}
            </button>
          </>
        }
      >
        <form id="add-aff-form" onSubmit={submitAdd} className="form-grid">
          <div className="form-group full">
            <label>Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Initial password</label>
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Defaults to phone"
            />
            <div className="form-hint">Leave blank to use phone number as password.</div>
          </div>
          <div className="form-group">
            <label>Plan</label>
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Edit affiliate"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="edit-aff-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        {editing && (
          <form id="edit-aff-form" onSubmit={submitEdit} className="form-grid">
            <div className="form-group">
              <label>Full name</label>
              <input
                value={editing.user.name}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, name: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editing.user.email || ""}
                onChange={(e) => setEditing({ ...editing, user: { ...editing.user, email: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label>Plan</label>
              <select value={editing.plan} onChange={(e) => setEditing({ ...editing, plan: e.target.value })}>
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full">
              <label>Internal notes</label>
              <textarea
                rows={3}
                value={editing.notes || ""}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </div>
            <div className="form-group full">
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!editing.user.active}
                  onChange={(e) => setEditing({ ...editing, user: { ...editing.user, active: e.target.checked } })}
                />
                User account active
              </label>
            </div>
          </form>
        )}
      </Modal>

      <ResetPasswordModal
        open={!!resetting}
        onClose={() => !saving && setResetting(null)}
        onConfirm={doReset}
        loading={saving}
        user={resetting?.user}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => !saving && setDeleting(null)}
        onConfirm={doDelete}
        loading={saving}
        title="Delete affiliate?"
        destructive
        message={`This will permanently delete ${deleting?.user?.name || ""} and all their events. This action cannot be undone.`}
        confirmLabel="Delete permanently"
      />
    </div>
  );
}

function ResetPasswordModal({ open, onClose, onConfirm, loading, user }) {
  const [pw, setPw] = useState("");
  useEffect(() => {
    setPw("");
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Reset password for ${user?.name || "user"}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (pw.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }
              onConfirm(pw);
            }}
            disabled={loading}
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>New password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <div className="form-hint">Minimum 6 characters. Share this with the user securely.</div>
      </div>
    </Modal>
  );
}
