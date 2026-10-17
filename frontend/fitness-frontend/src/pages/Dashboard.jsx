import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

function getApiErrorMessage(error, fallback) {
  if (!error.response) return "Unable to connect to the server. Please try again.";
  if (error.response.status === 400) return "The request was not valid.";
  if (error.response.status === 401) return "Your session has expired. Please log in again.";
  if (error.response.status === 403) return "You do not have permission to view this data.";
  if (error.response.status === 404) return "This dashboard data could not be found.";
  if (error.response.status >= 500) return "The server is unavailable right now. Please try again later.";
  return fallback;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({ workouts: "", nutrition: "", progress: "" });

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      axios.get("http://localhost:8080/api/workouts"),
      axios.get("http://localhost:8080/api/nutrition"),
      axios.get("http://localhost:8080/api/progress"),
    ]).then(([workoutResult, nutritionResult, progressResult]) => {
      if (!isMounted) return;

      const nextErrors = { workouts: "", nutrition: "", progress: "" };
      const results = [
        [workoutResult, "workouts", setWorkouts, "Unable to load workout data."],
        [nutritionResult, "nutrition", setNutrition, "Unable to load nutrition data."],
        [progressResult, "progress", setProgress, "Unable to load progress data."],
      ];

      results.forEach(([result, key, setData, fallback]) => {
        if (result.status === "fulfilled") {
          setData(result.value.data);
          return;
        }

        if (result.reason.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        nextErrors[key] = getApiErrorMessage(result.reason, fallback);
      });

      setErrors(nextErrors);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [logout, navigate]);

  const workoutCalories = workouts.reduce((total, workout) => total + (Number(workout.caloriesBurned) || 0), 0);
  const workoutDuration = workouts.reduce((total, workout) => total + (Number(workout.durationMinutes) || 0), 0);
  const nutritionTotals = nutrition.reduce((totals, meal) => ({
    calories: totals.calories + (Number(meal.calories) || 0),
    protein: totals.protein + (Number(meal.protein) || 0),
    carbs: totals.carbs + (Number(meal.carbs) || 0),
    fats: totals.fats + (Number(meal.fats) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  const sortedProgress = [...progress].sort((first, second) => (first.id ?? 0) - (second.id ?? 0));
  const latestProgress = sortedProgress[sortedProgress.length - 1];
  const previousProgress = sortedProgress[sortedProgress.length - 2];
  const currentWeight = latestProgress?.weight;
  const weightChange = latestProgress && previousProgress
    ? Number(latestProgress.weight) - Number(previousProgress.weight)
    : null;
  const recentWorkouts = workouts.slice(-3).reverse();
  const chartWorkouts = workouts.slice(-7);
  const maxDuration = Math.max(...chartWorkouts.map((workout) => Number(workout.durationMinutes) || 0), 1);
  const userInitial = (user?.name || "F").charAt(0).toUpperCase();
  const stats = [
    { label: "Workout Sessions", value: workouts.length, change: `${workoutDuration} min total`, icon: "🏋️", tone: "blue" },
    { label: "Calories Burned", value: workoutCalories.toLocaleString(), change: "From logged workouts", icon: "🔥", tone: "orange" },
    { label: "Current Weight", value: currentWeight == null ? "—" : `${Number(currentWeight).toFixed(1)} kg`, change: weightChange == null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg change`, icon: "⚖️", tone: "green" },
    { label: "Protein Intake", value: `${nutritionTotals.protein} g`, change: `${nutrition.length} meals recorded`, icon: "🥗", tone: "purple" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-brand"><div className="header-brand-mark">F</div><div className="header-brand-text">FITTRACK</div></div>
          <div className="header-user"><div className="welcome-text"><small>Authenticated member</small><strong>Good morning{user?.name ? `, ${user.name}` : ""}</strong></div><div className="user-avatar">{userInitial}</div></div>
        </header>
        <div className="dashboard-body">
          <aside className="sidebar"><ul className="nav-list">{navItems.map(({ name, path, icon }) => <li key={name}><NavLink to={path} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><span className="nav-icon">{icon}</span>{name}</NavLink></li>)}</ul><button type="button" className="nav-item logout-nav-item" onClick={logout}><span className="nav-icon">↪</span>Logout</button></aside>
          <main className="main-panel">
            <div className="dashboard-intro"><div><span className="eyebrow">Your daily overview</span><h1>Training at a glance</h1><p>Real numbers from your workout, nutrition, and progress records.</p></div><span className="streak-badge unavailable">Streak unavailable · dates needed</span></div>
            {isLoading ? <div className="dashboard-loading" role="status"><span className="loading-pulse"></span>Loading your dashboard data...</div> : <>
              <div className="top-summary"><div className="summary-card"><span className="summary-label">Training Time</span><span className="summary-value">{workoutDuration} min</span><span className="summary-trend">Across {workouts.length} sessions</span></div><div className="summary-card"><span className="summary-label">Nutrition Calories</span><span className="summary-value">{nutritionTotals.calories.toLocaleString()}</span><span className="summary-trend">{nutrition.length ? `${nutrition.length} meals logged` : "No meals recorded yet"}</span></div><div className="summary-card"><span className="summary-label">Progress Entries</span><span className="summary-value">{progress.length}</span><span className="summary-trend">{latestProgress ? "Latest record available" : "No progress records yet"}</span></div></div>
              <div className="content-grid"><section className="card welcome-card"><div className="welcome-header"><div><h2>Today&apos;s Goal</h2><p>No target is configured yet. Use your latest workout as a starting point or set a goal in your profile.</p></div><span className="status-pill neutral">Set a goal</span></div><div className="today-card">{workouts.length ? <><div className="card-title-row"><h3>Latest logged workout</h3><span className="mini-badge">No date recorded</span></div><div className="workout-plan"><div><strong>{workouts[workouts.length - 1].name}</strong><span>{workouts[workouts.length - 1].description}</span><div className="workout-meta"><span>⏱ {workouts[workouts.length - 1].durationMinutes} min</span><span>•</span><span>🔥 {workouts[workouts.length - 1].caloriesBurned} kcal</span></div></div></div></> : <div className="today-empty">No workouts yet. Add a workout to start tracking your training.</div>}</div></section><section className="card progress-card"><div className="card-title-row"><h3>Logged Workout Sessions</h3><span className="mini-badge">No dates available</span></div>{chartWorkouts.length ? <div className="chart" aria-label="Logged workout duration chart">{chartWorkouts.map((workout, index) => <div className="bar-column" key={workout.id ?? `${workout.name}-${index}`}><div className="bar" style={{ height: `${Math.max(18, ((Number(workout.durationMinutes) || 0) / maxDuration) * 100)}%` }}></div><span className="day-label">#{workouts.length - chartWorkouts.length + index + 1}</span></div>)}</div> : <p className="chart-empty">Add workouts to see a duration comparison.</p>}</section></div>
              <div className="stats-grid">{stats.map(({ label, value, change, icon, tone }) => <div key={label} className={`stat-card ${tone}`}><div className="stat-icon">{icon}</div><span className="stat-label">{label}</span><span className="stat-value">{value}</span><span className="stat-change">{change}</span></div>)}</div>
              <section className="card nutrition-dashboard-card"><div className="card-title-row"><h3>Nutrition Totals</h3><span className="mini-badge">All logged meals</span></div>{errors.nutrition ? <p className="dashboard-section-error" role="alert">{errors.nutrition}</p> : nutrition.length ? <div className="nutrition-dashboard-grid"><div><span>Calories</span><strong>{nutritionTotals.calories} kcal</strong></div><div><span>Protein</span><strong>{nutritionTotals.protein} g</strong></div><div><span>Carbs</span><strong>{nutritionTotals.carbs} g</strong></div><div><span>Fats</span><strong>{nutritionTotals.fats} g</strong></div></div> : <p className="dashboard-empty">No meals recorded yet.</p>}</section>
              <section className="card recent-card"><div className="card-title-row"><h3>Recent Workouts</h3><span className="mini-badge">Returned order</span></div>{errors.workouts ? <p className="workout-status error" role="alert">{errors.workouts}</p> : recentWorkouts.length ? <div className="recent-list">{recentWorkouts.map((workout) => <div className="recent-item" key={workout.id ?? workout.name}><div className="workout-details"><strong>{workout.name}</strong><small>{workout.description}</small></div><div className="workout-metrics"><span>{workout.durationMinutes} min</span><span>{workout.caloriesBurned} kcal</span></div></div>)}</div> : <p className="dashboard-empty">No workouts yet.</p>}</section>
              <section className="card latest-progress-card"><div className="card-title-row"><h3>Latest Progress</h3><span className="mini-badge">{progress.length ? `${progress.length} records` : "Empty"}</span></div>{errors.progress ? <p className="dashboard-section-error" role="alert">{errors.progress}</p> : latestProgress ? <div className="latest-progress-content"><div><span>Current weight</span><strong>{Number(latestProgress.weight).toFixed(1)} kg</strong></div><div><span>Weight change</span><strong>{weightChange == null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg`}</strong></div><p>{latestProgress.notes || "No notes added for the latest progress record."}</p></div> : <p className="dashboard-empty">No progress records yet.</p>}</section>
            </>}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
