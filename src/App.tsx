import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowUpRight,
  Disc3,
  Headphones,
  LayoutDashboard,
  LogOut,
  Music2,
  UserRound,
  Users,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router";

import {
  getCurrentUser,
  getErrorMessage,
  getOverview,
  login,
  logout,
} from "./api";

const adminUserKey = ["admin", "user"] as const;
const overviewKey = ["admin", "overview"] as const;
const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5173";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(adminUserKey, user);
      navigate("/", { replace: true });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    try {
      await loginMutation.mutateAsync();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <Link to="/login" className="brand brand-light" aria-label="AFTERHOURS Admin">
          <span className="brand-mark"><Headphones size={20} /></span>
          <span>AFTERHOURS<span className="brand-sub">ADMIN</span></span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow">Marketplace operations</p>
          <h1>Keep the<br />music moving.</h1>
          <p>Manage the catalog and keep an eye on the AFTERHOURS marketplace.</p>
        </div>
        <div className="story-decoration" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
        <p className="story-foot">A quieter way to run a louder marketplace.</p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand brand">
            <span className="brand-mark"><Headphones size={20} /></span>
            <span>AFTERHOURS<span className="brand-sub">ADMIN</span></span>
          </div>
          <div className="login-heading">
            <p className="eyebrow">Administrator access</p>
            <h2>Welcome back</h2>
            <p>Sign in with an account that has admin access.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button login-button" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in…" : "Sign in to dashboard"}
              <ArrowUpRight size={17} />
            </button>
          </form>
          <p className="login-note">Admin access is granted separately by a project operator.</p>
        </div>
        <p className="login-copyright">© {new Date().getFullYear()} AFTERHOURS</p>
      </section>
    </main>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: adminUserKey, queryFn: getCurrentUser });
  const overviewQuery = useQuery({
    queryKey: overviewKey,
    queryFn: getOverview,
    enabled: userQuery.data?.role === "ADMIN",
  });
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  useEffect(() => {
    if (userQuery.isError) navigate("/login", { replace: true });
  }, [userQuery.isError, navigate]);

  if (userQuery.isPending || (userQuery.data && overviewQuery.isPending)) {
    return <div className="full-state">Checking administrator access…</div>;
  }
  if (userQuery.isError || !userQuery.data) return null;

  const overview = overviewQuery.data;
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link to="/" className="brand brand-light">
          <span className="brand-mark"><Headphones size={20} /></span>
          <span>AFTERHOURS<span className="brand-sub">ADMIN</span></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Admin navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={17} />Overview</a>
          <a className="nav-item" href="#catalog"><Disc3 size={17} />Beat catalog</a>
          <span className="nav-item disabled"><Users size={17} />Customers <small>SOON</small></span>
          <span className="nav-item disabled"><UserRound size={17} />Producers <small>SOON</small></span>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-avatar">{userQuery.data.username.slice(0, 1).toUpperCase()}</div>
          <div className="profile-info"><strong>{userQuery.data.username}</strong><span>Administrator</span></div>
          <button className="icon-button signout-icon" aria-label="Sign out" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-user"><span className="online-dot" /> Admin workspace</div>
        </header>
        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{today}</p>
              <h1>Overview</h1>
              <p className="heading-subtitle">Here’s what’s happening across your marketplace.</p>
            </div>
            <a className="storefront-link" href={storefrontUrl} target="_blank" rel="noreferrer">Open storefront <ArrowUpRight size={16} /></a>
          </div>

          {overviewQuery.isError ? (
            <div className="notice error-notice" role="alert">{getErrorMessage(overviewQuery.error)}</div>
          ) : null}

          <section className="stat-grid" aria-label="Marketplace totals">
            <StatCard label="Total beats" value={overview?.stats.beats} icon={<Music2 size={19} />} accent="violet" />
            <StatCard label="Published beats" value={overview?.stats.publishedBeats} icon={<Disc3 size={19} />} accent="pink" />
            <StatCard label="Producers" value={overview?.stats.producers} icon={<UserRound size={19} />} accent="blue" />
            <StatCard label="Customers" value={overview?.stats.users} icon={<Users size={19} />} accent="green" />
          </section>

          <section className="catalog-panel" id="catalog">
            <div className="panel-heading">
              <div><p className="eyebrow">Marketplace content</p><h2>Recent beats</h2></div>
              <span className="panel-count">{overview?.stats.beats ?? 0} total</span>
            </div>
            {overviewQuery.isError ? null : overview?.recentBeats.length ? (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Beat</th><th>Producer</th><th>Genre</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {overview.recentBeats.map((beat) => (
                      <tr key={beat.id}>
                        <td><span className="track-icon"><Music2 size={15} /></span><strong>{beat.title}</strong></td>
                        <td>{beat.producer.name}</td>
                        <td>{beat.genre}</td>
                        <td>${beat.price}</td>
                        <td><span className={`status-pill ${beat.published ? "published" : "draft"}`}><span />{beat.published ? "Published" : "Draft"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-empty">No beats have been added yet.</div>
            )}
          </section>
          <p className="dashboard-footnote">Dashboard data is loaded from the AFTERHOURS API. Catalog editing will be added in a later step.</p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value?: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${accent}`}>{icon}</div>
      <p>{label}</p>
      <strong>{value ?? "—"}</strong>
      <span className="stat-caption">All time</span>
    </article>
  );
}
