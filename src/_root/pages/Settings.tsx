import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeProvider";
import { getCurrentUser, updateUserProfile, changePassword } from "@/lib/appwrite/api";


// ─── Color palettes ───────────────────────────────────────────────
const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

// Dark mode overrides
const D = {
  bg:         "#0f1a14",   // page background
  surface:    "#1a2b20",   // cards / modals
  border:     "#2a3f30",   // borders
  text:       "#d6ebe0",   // primary text
  subtext:    "#7bbf9a",   // secondary text
  muted:      "#3a5444",   // muted / disabled
  hover:      "#1e3326",   // row hover
  inputBg:    "#152019",   // input background
};

type ModalKey =
  | "edit-profile" | "change-password"
  | "language" | "activity" | null;

const LANGUAGES = ["English", "Arabic", "French", "Spanish", "German", "Turkish", "Italian", "Portuguese"];

const useToast = () => {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2800); };
  return { msg, show };
};

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDark } = useTheme();
  const { msg: toastMsg, show: showToast } = useToast();

  const [user, setUser]               = useState<any>(null);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [loading, setLoading]         = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage]       = useState("English");
  const [tempLanguage, setTempLanguage] = useState("English");

  const [profileName, setProfileName] = useState("");
  const [profileBio,  setProfileBio]  = useState("");
  const [currPw,    setCurrPw]    = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { navigate("/sign-in"); return; }
      setUser(u);
      setProfileName(u.name ?? "");
      setProfileBio(u.bio ?? "");
    });
  }, []);

  const open  = (m: ModalKey) => setActiveModal(m);
  const close = ()             => setActiveModal(null);

  const handleToggleDark = () => {
    toggleDark();
    showToast(darkMode ? "Dark mode off" : "Dark mode on");
  };

  const toggleNotifications = () => {
    const next = !notifications; setNotifications(next);
    showToast(next ? "Notifications enabled" : "Notifications disabled");
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return showToast("Name cannot be empty");
    setLoading(true);
    try {
      const updated = await updateUserProfile({
        userId: user.$id,
        name: profileName.trim(),
        bio: profileBio,
      });
      setUser({ ...user, ...updated });
      showToast("Profile saved ✓");
      close();
    } catch (err: any) {
      showToast(err?.message ?? "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currPw || !newPw || !confirmPw) return showToast("Fill in all fields");
    if (newPw !== confirmPw)             return showToast("Passwords don't match");
    if (newPw.length < 8)               return showToast("Password must be at least 8 characters");
    setLoading(true);
    try {
      await changePassword({ currentPassword: currPw, newPassword: newPw });
      setCurrPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password updated ✓");
      close();
    } catch (err: any) {
      showToast(err?.message ?? "Wrong current password or request failed");
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.name ?? "?")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // ── Computed theme tokens ──────────────────────────────────────
  const t = {
    pageBg:    darkMode ? D.bg      : `linear-gradient(180deg, ${P[50]}, #ffffff)`,
    surface:   darkMode ? D.surface : "#fff",
    border:    darkMode ? D.border  : P[200],
    text:      darkMode ? D.text    : P[700],
    subtext:   darkMode ? D.subtext : P[500],
    muted:     darkMode ? D.muted   : P[400],
    hover:     darkMode ? D.hover   : P[50],
    sectionBg: darkMode ? D.surface : "#fff",
    inputBg:   darkMode ? D.inputBg : "#fff",
    iconBg:    darkMode ? D.muted   : P[100],
  };

  return (
    <div
      className="min-h-screen px-4 py-10 transition-colors duration-300"
      style={{ background: t.pageBg, color: t.text }}
    >
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold" style={{ color: t.text }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: t.muted }}>Manage your account and preferences</p>
        </div>

        {/* Profile card */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{ borderColor: t.border, background: t.surface }}
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: t.iconBg, color: t.text }}
            >{initials}</div>
          )}
          <div>
            <p className="font-semibold" style={{ color: t.text }}>{user?.name ?? "Loading…"}</p>
            {user?.username && <p className="text-sm" style={{ color: t.subtext }}>@{user.username}</p>}
            <p className="text-sm" style={{ color: t.muted }}>{user?.email}</p>
            {user?.bio && <p className="text-xs mt-0.5 italic" style={{ color: t.subtext }}>{user.bio}</p>}
          </div>
        </div>

        <Section title="Account" t={t}>
          <SettingRow t={t} icon="✏️" label="Edit Profile"    sub="Name, bio"            onClick={() => open("edit-profile")} />
          <SettingRow t={t} icon="🔑" label="Change Password" sub="Update your password" onClick={() => open("change-password")} />
        </Section>

        <Section title="Preferences" t={t}>
          <SettingRow t={t} icon="🌙" label="Dark Mode"
            onClick={handleToggleDark}
            right={<Toggle on={darkMode} onToggle={handleToggleDark} />} />
          <SettingRow t={t} icon="🔔" label="Notifications" sub={notifications ? "Enabled" : "Disabled"}
            right={<Toggle on={notifications} onToggle={toggleNotifications} />} />
          <SettingRow t={t} icon="🌐" label="Language"
            right={<span style={{ fontSize: 13, color: t.subtext }}>{language}</span>}
            onClick={() => { setTempLanguage(language); open("language"); }} />
        </Section>

        <Section title="Activity" t={t}>
          <SettingRow t={t} icon="📋" label="Activity Log" onClick={() => open("activity")} />
        </Section>

      </div>

      {/* ── Modals ── */}
      <Modal open={activeModal === "edit-profile"} onClose={close} darkMode={darkMode} t={t}
        title="Edit Profile" subtitle="Changes will show across the whole app">
        <ModalInput label="Full name" value={profileName} onChange={setProfileName} placeholder="Full name" t={t} />
        <ModalInput label="Bio"       value={profileBio}  onChange={setProfileBio}  placeholder="A short bio (optional)" t={t} />
        <ModalActions onClose={close} onSave={handleSaveProfile} saveLabel="Save changes" loading={loading} t={t} />
      </Modal>

      <Modal open={activeModal === "change-password"} onClose={close} darkMode={darkMode} t={t}
        title="Change Password" subtitle="Enter your current and new password">
        <ModalInput label="Current password"     value={currPw}    onChange={setCurrPw}    type="password" placeholder="Current password" t={t} />
        <ModalInput label="New password"         value={newPw}     onChange={setNewPw}     type="password" placeholder="At least 8 characters" t={t} />
        <ModalInput label="Confirm new password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat new password" t={t} />
        <ModalActions onClose={close} onSave={handleSavePassword} saveLabel="Update password" loading={loading} t={t} />
      </Modal>

      <Modal open={activeModal === "language"} onClose={close} darkMode={darkMode} t={t}
        title="Language" subtitle="Select your preferred language">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {LANGUAGES.map((lang) => (
            <button key={lang} onClick={() => setTempLanguage(lang)}
              className="py-2 px-3 rounded-xl text-sm border transition-all"
              style={{
                borderColor: tempLanguage === lang ? P[500] : t.border,
                background:  tempLanguage === lang ? (darkMode ? D.muted : P[100]) : t.surface,
                color:       tempLanguage === lang ? (darkMode ? D.text : P[700]) : t.subtext,
                fontWeight:  tempLanguage === lang ? 600 : 400,
              }}>{lang}</button>
          ))}
        </div>
        <ModalActions onClose={close}
          onSave={() => { setLanguage(tempLanguage); showToast(`Language set to ${tempLanguage} ✓`); close(); }}
          saveLabel="Apply" t={t} />
      </Modal>

      <Modal open={activeModal === "activity"} onClose={close} darkMode={darkMode} t={t}
        title="Activity Log" subtitle="">
        <div className="divide-y text-sm" style={{ borderColor: t.border }}>
          {[
            { label: "Logged in",        time: "Today" },
            { label: "Profile updated",  time: "Yesterday" },
            { label: "Password changed", time: "Apr 10" },
            { label: "Account created",  time: "Mar 1" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2">
              <span style={{ color: t.text }}>{item.label}</span>
              <span style={{ color: t.muted }}>{item.time}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={close} className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: P[600], color: "#fff" }}>Close</button>
        </div>
      </Modal>

      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium text-white shadow-lg z-50"
          style={{ background: P[700] }}
        >{toastMsg}</div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────

const Section = ({ title, children, t }: { title: string; children: React.ReactNode; t: any }) => (
  <div>
    <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: t.muted }}>{title}</h2>
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: t.border, background: t.surface }}>{children}</div>
  </div>
);

const SettingRow = ({ icon, label, sub, right, onClick, danger, t }: {
  icon: string; label: string; sub?: string; right?: React.ReactNode;
  onClick?: () => void; danger?: boolean; t: any;
}) => (
  <div
    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors"
    style={{ borderColor: t.border, cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
    onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = t.hover; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.surface; }}
  >
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ background: danger ? "#3b1212" : t.iconBg }}>{icon}</span>
      <div>
        <p className="text-sm font-medium" style={{ color: danger ? "#f87171" : t.text }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: t.muted }}>{sub}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {right ?? (onClick && <span style={{ color: t.muted, fontSize: 18 }}>›</span>)}
    </div>
  </div>
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    style={{
      width: 40, height: 22, borderRadius: 11,
      background: on ? P[500] : "#4a5568",
      border: "none", cursor: "pointer", position: "relative",
    }}
  >
    <span style={{
      position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: "50%",
      background: "#fff", display: "block", transition: "transform 0.2s",
      transform: on ? "translateX(18px)" : "translateX(0)", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
    }} />
  </button>
);

const Modal = ({ open, onClose, title, subtitle, children, darkMode, t }: {
  open: boolean; onClose: () => void; title: string; subtitle: string;
  children: React.ReactNode; darkMode: boolean; t: any;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: darkMode ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-xl transition-colors duration-300"
        style={{ background: t.surface, borderColor: t.border }}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: t.text }}>{title}</h2>
        {subtitle && <p className="text-sm mb-4" style={{ color: t.muted }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

const ModalInput = ({ label, value, onChange, placeholder, type = "text", shake, t }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; shake?: boolean; t: any;
}) => (
  <div className="mb-3">
    <label className="block text-xs mb-1 font-medium" style={{ color: t.subtext }}>{label}</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors"
      style={{
        borderColor: shake ? "#ef4444" : t.border,
        color: t.text,
        background: t.inputBg,
        animation: shake ? "shake 0.4s ease" : "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = P[500])}
      onBlur={(e)  => (e.target.style.borderColor = t.border)}
    />
    <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
  </div>
);

const ModalActions = ({ onClose, onSave, saveLabel, danger = false, loading = false, t }: {
  onClose: () => void; onSave: () => void; saveLabel: string;
  danger?: boolean; loading?: boolean; t: any;
}) => (
  <div className="flex justify-end gap-2 mt-4">
    <button onClick={onClose} disabled={loading}
      className="px-4 py-2 rounded-xl text-sm border"
      style={{ borderColor: t.border, color: t.subtext, background: t.surface }}>Cancel</button>
    <button onClick={onSave} disabled={loading}
      className="px-4 py-2 rounded-xl text-sm font-medium"
      style={{
        background: danger ? "#3b1212" : P[600],
        color: danger ? "#f87171" : "#fff",
        border: danger ? "1px solid #7f1d1d" : "none",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}>{loading ? "Saving…" : saveLabel}</button>
  </div>
);

export default Settings;