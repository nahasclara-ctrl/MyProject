import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

// ─── Color palette ───────────────────────────────────────────────
const P = {
  50:  "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

// ─── Types ───────────────────────────────────────────────────────
type ModalKey =
  | "edit-profile"
  | "change-password"
  | "logout"
  | "delete-account"
  | "language"
  | "privacy"
  | "blocked"
  | "activity"
  | null;

// ─── Languages ───────────────────────────────────────────────────
const LANGUAGES = [
  "English", "Arabic", "French", "Spanish",
  "German", "Turkish", "Italian", "Portuguese",
];

// ─── Toast ───────────────────────────────────────────────────────
const useToast = () => {
  const [msg, setMsg] = useState<string | null>(null);

  const show = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2400);
  };

  return { msg, show };
};

// ─── Main Component ──────────────────────────────────────────────
const Settings = () => {
  const { user, logout } = useUserContext();
  const { msg: toastMsg, show: showToast } = useToast();

  const [activeModal, setActiveModal]     = useState<ModalKey>(null);
  const [darkMode, setDarkMode]           = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage]           = useState("English");
  const [tempLanguage, setTempLanguage]   = useState("English");
  const [privacyVis, setPrivacyVis]       = useState("Public");
  const [privacyMsg, setPrivacyMsg]       = useState("Everyone");

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name     ?? "");
  const [profileUser, setProfileUser] = useState(user?.username ?? "");
  const [profileBio,  setProfileBio]  = useState("");

  // Password state
  const [currPw,    setCurrPw]    = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm]   = useState("");
  const [deleteShake,   setDeleteShake]     = useState(false);

  // Persist dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    showToast(next ? "Dark mode on" : "Dark mode off");
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    showToast(next ? "Notifications enabled" : "Notifications disabled");
  };

  const open  = (modal: ModalKey) => setActiveModal(modal);
  const close = ()                 => setActiveModal(null);

  // ── Save handlers ────────────────────────────────────────────
  const handleSaveProfile = () => {
    // Call your API here, e.g. updateUser({ name: profileName, username: profileUser, bio: profileBio })
    showToast("Profile saved ✓");
    close();
  };

  const handleSavePassword = () => {
    if (!currPw || !newPw || !confirmPw) return showToast("Fill in all fields");
    if (newPw !== confirmPw)             return showToast("Passwords don't match");
    // Call your API here, e.g. changePassword({ current: currPw, next: newPw })
    setCurrPw(""); setNewPw(""); setConfirmPw("");
    showToast("Password updated ✓");
    close();
  };

  const handleLogout = () => {
    logout();
    close();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteShake(true);
      setTimeout(() => setDeleteShake(false), 600);
      return;
    }
    // Call your API here, e.g. deleteAccount()
    showToast("Account deleted");
    close();
  };

  const handleSaveLanguage = () => {
    setLanguage(tempLanguage);
    showToast(`Language set to ${tempLanguage} ✓`);
    close();
  };

  const handleSavePrivacy = () => {
    // Call your API here, e.g. updatePrivacy({ visibility: privacyVis, messaging: privacyMsg })
    showToast("Privacy settings saved ✓");
    close();
  };

  // ── Derived display values ───────────────────────────────────
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ── Render ───────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: `linear-gradient(180deg, ${P[50]}, #ffffff)`, color: P[700] }}
    >
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: P[700] }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: P[400] }}>
            Manage your account, privacy, and preferences
          </p>
        </div>

        {/* ── Profile card ── */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{ borderColor: P[200], background: "#fff" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: P[200], color: P[700] }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold" style={{ color: P[700] }}>{user?.name}</p>
            <p className="text-sm" style={{ color: P[500] }}>@{user?.username}</p>
            <p className="text-sm" style={{ color: P[400] }}>{user?.email}</p>
          </div>
        </div>

        {/* ── Account ── */}
        <Section title="Account">
          <SettingRow
            icon="✏️"
            label="Edit Profile"
            sub="Name, username, bio"
            onClick={() => open("edit-profile")}
          />
          <SettingRow
            icon="🔑"
            label="Change Password"
            sub="Update your password"
            onClick={() => open("change-password")}
          />
          <SettingRow
            icon="🚪"
            label="Log Out"
            danger
            onClick={() => open("logout")}
          />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            danger
            onClick={() => open("delete-account")}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            right={<Toggle on={darkMode} onToggle={toggleDark} />}
          />
          <SettingRow
            icon="🔔"
            label="Notifications"
            sub={notifications ? "Push & email enabled" : "All notifications off"}
            right={<Toggle on={notifications} onToggle={toggleNotifications} />}
          />
          <SettingRow
            icon="🌐"
            label="Language"
            right={<span style={{ fontSize: 13, color: P[500] }}>{language}</span>}
            onClick={() => { setTempLanguage(language); open("language"); }}
          />
        </Section>

        {/* ── Privacy ── */}
        <Section title="Privacy & Security">
          <SettingRow
            icon="🔒"
            label="Privacy Settings"
            sub={`Profile: ${privacyVis}`}
            onClick={() => open("privacy")}
          />
          <SettingRow
            icon="🚫"
            label="Blocked Users"
            sub="0 blocked"
            onClick={() => open("blocked")}
          />
          <SettingRow
            icon="📋"
            label="Activity Log"
            onClick={() => open("activity")}
          />
        </Section>
      </div>

      {/* ── Modals ── */}

      {/* Edit Profile */}
      <Modal open={activeModal === "edit-profile"} onClose={close} title="Edit Profile" subtitle="Update your public information">
        <ModalInput label="Full name"  value={profileName} onChange={setProfileName} placeholder="Full name" />
        <ModalInput label="Username"   value={profileUser} onChange={setProfileUser} placeholder="Username" />
        <ModalInput label="Bio"        value={profileBio}  onChange={setProfileBio}  placeholder="Bio (optional)" />
        <ModalActions onClose={close} onSave={handleSaveProfile} saveLabel="Save changes" />
      </Modal>

      {/* Change Password */}
      <Modal open={activeModal === "change-password"} onClose={close} title="Change Password" subtitle="Enter your current and new password">
        <ModalInput label="Current password"  value={currPw}    onChange={setCurrPw}    type="password" placeholder="Current password" />
        <ModalInput label="New password"      value={newPw}     onChange={setNewPw}     type="password" placeholder="New password" />
        <ModalInput label="Confirm password"  value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Confirm new password" />
        <ModalActions onClose={close} onSave={handleSavePassword} saveLabel="Update password" />
      </Modal>

      {/* Log Out */}
      <Modal open={activeModal === "logout"} onClose={close} title="Log out?" subtitle="You'll need to sign back in to access your account.">
        <ModalActions onClose={close} onSave={handleLogout} saveLabel="Log out" danger />
      </Modal>

      {/* Delete Account */}
      <Modal open={activeModal === "delete-account"} onClose={close} title="Delete account?" subtitle='This is permanent and cannot be undone. Type "DELETE" to confirm.'>
        <ModalInput
          label='Type "DELETE" to confirm'
          value={deleteConfirm}
          onChange={setDeleteConfirm}
          placeholder="DELETE"
          shake={deleteShake}
        />
        <ModalActions onClose={close} onSave={handleDeleteAccount} saveLabel="Delete forever" danger />
      </Modal>

      {/* Language */}
      <Modal open={activeModal === "language"} onClose={close} title="Language" subtitle="Select your preferred language">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setTempLanguage(lang)}
              className="py-2 px-3 rounded-xl text-sm border transition-all"
              style={{
                borderColor:    tempLanguage === lang ? P[500] : P[200],
                background:     tempLanguage === lang ? P[100]  : "#fff",
                color:          tempLanguage === lang ? P[700]  : P[500],
                fontWeight:     tempLanguage === lang ? 600     : 400,
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <ModalActions onClose={close} onSave={handleSaveLanguage} saveLabel="Apply" />
      </Modal>

      {/* Privacy */}
      <Modal open={activeModal === "privacy"} onClose={close} title="Privacy Settings" subtitle="Control who can see your profile and activity">
        <ModalSelect label="Profile visibility" value={privacyVis} onChange={setPrivacyVis} options={["Public", "Friends only", "Private"]} />
        <ModalSelect label="Who can message you" value={privacyMsg} onChange={setPrivacyMsg} options={["Everyone", "Friends only", "No one"]} />
        <ModalActions onClose={close} onSave={handleSavePrivacy} saveLabel="Save" />
      </Modal>

      {/* Blocked */}
      <Modal open={activeModal === "blocked"} onClose={close} title="Blocked Users" subtitle="">
        <p className="text-sm mb-4" style={{ color: P[400] }}>You haven't blocked anyone yet.</p>
        <div className="flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: P[600], color: "#fff" }}
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Activity Log */}
      <Modal open={activeModal === "activity"} onClose={close} title="Activity Log" subtitle="">
        <div className="divide-y text-sm" style={{ color: P[500] }}>
          {[
            { label: "Logged in",        time: "Today, 9:14 AM" },
            { label: "Profile updated",  time: "Yesterday" },
            { label: "Password changed", time: "Apr 10" },
            { label: "Account created",  time: "Mar 1" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2">
              <span style={{ color: P[700] }}>{item.label}</span>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: P[600], color: "#fff" }}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium text-white shadow-lg z-50 transition-all"
          style={{ background: P[700] }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};

// ─── Section ─────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: P[400] }}>
      {title}
    </h2>
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: P[200], background: "#fff" }}>
      {children}
    </div>
  </div>
);

// ─── SettingRow ───────────────────────────────────────────────────
interface SettingRowProps {
  icon:    string;
  label:   string;
  sub?:    string;
  right?:  React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

const SettingRow = ({ icon, label, sub, right, onClick, danger }: SettingRowProps) => (
  <div
    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors"
    style={{ borderColor: P[100], cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
    onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = P[50]; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
  >
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ background: danger ? "#fef2f2" : P[100] }}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium" style={{ color: danger ? "#b91c1c" : P[700] }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: P[400] }}>{sub}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {right ?? (onClick && <span style={{ color: P[300], fontSize: 18 }}>›</span>)}
    </div>
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────
const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className="relative flex-shrink-0 transition-colors duration-200"
    style={{
      width: 40, height: 22, borderRadius: 11,
      background: on ? P[500] : P[200],
      border: "none", cursor: "pointer",
    }}
    aria-label="Toggle"
  >
    <span
      className="absolute top-0.5 transition-transform duration-200"
      style={{
        left: 3, width: 16, height: 16, borderRadius: "50%",
        background: "#fff", display: "block",
        transform: on ? "translateX(18px)" : "translateX(0)",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }}
    />
  </button>
);

// ─── Modal ────────────────────────────────────────────────────────
interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  subtitle: string;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, title, subtitle, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-xl"
        style={{ background: "#fff", borderColor: P[200] }}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: P[700] }}>{title}</h2>
        {subtitle && <p className="text-sm mb-4" style={{ color: P[400] }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

// ─── ModalInput ───────────────────────────────────────────────────
interface ModalInputProps {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  type?:       string;
  shake?:      boolean;
}

const ModalInput = ({ label, value, onChange, placeholder, type = "text", shake }: ModalInputProps) => (
  <div className="mb-3">
    <label className="block text-xs mb-1 font-medium" style={{ color: P[500] }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all"
      style={{
        borderColor: shake ? "#ef4444" : P[200],
        color: P[700],
        animation: shake ? "shake 0.4s ease" : "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = P[500])}
      onBlur={(e)  => (e.target.style.borderColor = P[200])}
    />
    <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
  </div>
);

// ─── ModalSelect ──────────────────────────────────────────────────
const ModalSelect = ({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div className="mb-3">
    <label className="block text-xs mb-1 font-medium" style={{ color: P[500] }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
      style={{ borderColor: P[200], color: P[700], background: "#fff" }}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

// ─── ModalActions ─────────────────────────────────────────────────
const ModalActions = ({
  onClose, onSave, saveLabel, danger = false,
}: { onClose: () => void; onSave: () => void; saveLabel: string; danger?: boolean }) => (
  <div className="flex justify-end gap-2 mt-4">
    <button
      onClick={onClose}
      className="px-4 py-2 rounded-xl text-sm border transition-colors"
      style={{ borderColor: P[200], color: P[500], background: "#fff" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = P[50])}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      Cancel
    </button>
    <button
      onClick={onSave}
      className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: danger ? "#fef2f2" : P[600],
        color:      danger ? "#b91c1c" : "#fff",
        border:     danger ? "1px solid #fca5a5" : "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#fee2e2" : P[700])}
      onMouseLeave={(e) => (e.currentTarget.style.background = danger ? "#fef2f2" : P[600])}
    >
      {saveLabel}
    </button>
  </div>
);

export default Settings;