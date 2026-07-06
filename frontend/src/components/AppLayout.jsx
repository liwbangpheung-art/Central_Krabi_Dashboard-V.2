import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createApiClient } from "../lib/api.js";
import { LoadingScreen } from "./LoadingScreen.jsx";
import { hasPermission, roleLabels } from "../lib/permissions.js";

const themes = [
  { id: "lavender", label: "Lavender" },
  { id: "mint", label: "Mint" },
  { id: "rose", label: "Rose Pink" }
];

const navigationGroups = [
  {
    label: "ภาพรวม",
    items: [
      { to: "/", label: "แดชบอร์ดภาพรวม", icon: "📊", end: true }
    ]
  },
  {
    label: "กรอกข้อมูล",
    items: [
      { to: "/entry/tissue", label: "กระดาษทิชชู่ (รายเดือน)", icon: "📄" },
      { to: "/entry/garbage-bag", label: "ถุงดำ/ถุงขยะ (รายเดือน)", icon: "📦" },
      { to: "/entry/rdf", label: "ขยะ RDF (รายวัน)", icon: "💲" },
      { to: "/entry/dog-food", label: "อาหารหมา (รายวัน)", icon: "▰" },
      { to: "/entry/wet-waste", label: "ขยะเปียก & อาหารหมู", icon: "▰" },
      { to: "/entry/recycle", label: "ขยะรีไซเคิล (รายเดือน)", icon: "♻️" }
    ]
  },
  {
    label: "รายงาน",
    items: [
      { to: "/analytics", label: "วิเคราะห์และกราฟ", icon: "📈" },
      { to: "/export", label: "สร้างรายงาน PowerPoint", icon: "📤" },
      { to: "/data-quality", label: "ตรวจคุณภาพข้อมูล", icon: "✅" }
    ]
  },
  {
    label: "จัดการระบบ",
    items: [
      { to: "/master-data", label: "จัดการประเภทข้อมูล", icon: "🗂️" },
      { to: "/users", label: "จัดการผู้ใช้", icon: "👥", permission: "manage_users" }
    ]
  }
];

export function AppLayout({ config }) {
  const { session, signOut, accessToken } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("ck-theme") || "lavender";
    } catch {
      return "lavender";
    }
  });
  const [profileState, setProfileState] = useState({ loading: true, profile: null, permissions: [], error: null });
  const api = useMemo(
    () => createApiClient({ apiUrl: config.apiUrl, getAccessToken: accessToken }),
    [config.apiUrl, accessToken]
  );

  const loadProfile = useCallback(async () => {
    setProfileState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await api.request("/api/me");
      setProfileState({ loading: false, profile: data.profile, permissions: data.permissions || [], error: null });
    } catch (error) {
      setProfileState({ loading: false, profile: null, permissions: [], error });
    }
  }, [api]);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("ck-theme", theme);
    } catch {
      // ignore storage failures in restricted browser modes
    }
  }, [theme]);

  if (profileState.loading) return <LoadingScreen />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-label="Central Krabi">
            <img src="/central-krabi-logo.png" alt="Central Krabi" className="sidebar-logo-image" />
          </div>
          <p className="sidebar-brand-subtitle">Waste & Resource Management</p>
        </div>
        <nav aria-label="เมนูหลัก" className="sidebar-nav-grouped">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.permission || hasPermission(profileState.permissions, item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <section className="nav-group" key={group.label}>
                <p className="nav-group-label">{group.label}</p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    to={item.to}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </section>
            );
          })}
        </nav>
        <div className="sidebar-note">ผู้พัฒนา<br /><strong>TongserviceIT</strong></div>
      </aside>

      <main className="dashboard-main">
        <header className="global-topbar">
          <div>
            <p className="eyebrow">{config.organizationName}</p>
            <strong>Waste & Resource Management</strong>
          </div>
          <div className="global-actions">
            <div className="theme-switch" aria-label="เลือกธีมสี">
              {themes.map((item) => (
                <button key={item.id} type="button" className={theme === item.id ? "selected" : ""} onClick={() => setTheme(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="account-chip">
              <span>{(profileState.profile?.full_name || session?.user?.email || "U").slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{profileState.profile?.full_name || session?.user?.email}</strong>
                <small>{roleLabels[profileState.profile?.role] || profileState.profile?.role || "ไม่ทราบสิทธิ์"}</small>
              </div>
            </div>
            <button className="secondary-button" type="button" onClick={() => signOut()}>ออกจากระบบ</button>
          </div>
        </header>

        {profileState.error ? (
          <section className="connection-error page-error" role="alert">
            <div>
              <p className="eyebrow">Profile Error</p>
              <h2>โหลด Profile และสิทธิ์ไม่สำเร็จ</h2>
              <p>{profileState.error.message}</p>
              <code>{profileState.error.url || `${config.apiUrl}/api/me`}</code>
            </div>
            <button className="primary-button compact" type="button" onClick={loadProfile}>ลองใหม่</button>
          </section>
        ) : (
          <Outlet context={{ config, api, profile: profileState.profile, permissions: profileState.permissions, refreshProfile: loadProfile }} />
        )}
      </main>
    </div>
  );
}
