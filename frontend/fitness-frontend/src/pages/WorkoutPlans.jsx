import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./WorkoutPlans.css";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Exercises", path: "/exercises", icon: "💪" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

const planFilters = ["All", "Beginner", "Intermediate", "Advanced"];

const workoutPlans = [
  {
    name: "Muscle Building",
    description: "A high-volume training routine designed to increase strength and lean muscle mass with progressive overload.",
    level: "Intermediate",
    duration: "8 weeks",
    exercises: 18,
    icon: "💪",
  },
  {
    name: "Fat Loss",
    description: "An efficient calorie-burning program combining strength work, intervals, and conditioning for leaner results.",
    level: "Beginner",
    duration: "6 weeks",
    exercises: 16,
    icon: "🔥",
  },
  {
    name: "Strength Training",
    description: "Power-focused programming for improved performance, heavier lifts, and serious total-body strength development.",
    level: "Advanced",
    duration: "10 weeks",
    exercises: 20,
    icon: "🏋️",
  },
  {
    name: "Full Body",
    description: "Balanced training for all major muscle groups with manageable sessions and sustainable weekly progression.",
    level: "Beginner",
    duration: "5 weeks",
    exercises: 14,
    icon: "🏆",
  },
  {
    name: "Beginner Fitness",
    description: "A welcoming full-body routine that builds confidence, consistency, and foundational movement quality.",
    level: "Beginner",
    duration: "4 weeks",
    exercises: 12,
    icon: "🌱",
  },
  {
    name: "Cardio & Conditioning",
    description: "Performance-driven conditioning routines built to elevate endurance, stamina, and cardiovascular efficiency.",
    level: "Intermediate",
    duration: "7 weeks",
    exercises: 15,
    icon: "🚴",
  },
];

function WorkoutPlans() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("");
  const visiblePlans = activeFilter === "All"
    ? workoutPlans
    : workoutPlans.filter((plan) => plan.level === activeFilter);

  return (
    <div className="workoutplans-page">
      <div className="workoutplans-shell">
        <header className="workoutplans-header">
          <div className="header-brand">
            <div className="header-brand-mark">F</div>
            <div className="header-brand-text">FITTRACK</div>
          </div>

          <div className="header-user">
            <div className="welcome-text">
              <small>Welcome</small>
              <strong>Welcome back, Nagesh!</strong>
            </div>
            <div className="user-avatar">N</div>
            <NavLink className="logout-btn" to="/login">
              Logout
            </NavLink>
          </div>
        </header>

        <div className="workoutplans-body">
          <aside className="sidebar">
            <ul className="nav-list">
              {navItems.map(({ name, path, icon }) => (
                <li key={name}>
                  <NavLink
                    to={path}
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="nav-icon">{icon}</span>
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>

          <main className="main-panel">
            <div className="page-header">
              <h1>Workout Plans</h1>
              <p>Choose a workout plan and stay consistent.</p>
            </div>

            <div className="filters">
              {planFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="plans-grid">
              {visiblePlans.map((plan) => (
                <article className="plan-card" key={plan.name}>
                  <div className="plan-top">
                    <div className="plan-icon">{plan.icon}</div>
                    <span className="plan-level">{plan.level}</span>
                  </div>

                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>

                  <div className="plan-meta">
                    <div className="meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{plan.duration}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Exercises</span>
                      <span className="meta-value">{plan.exercises}</span>
                    </div>
                  </div>

                  <button type="button" className="plan-btn" onClick={() => setSelectedPlan(plan.name)}>
                    {selectedPlan === plan.name ? "Plan Selected" : "View Plan"}
                  </button>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPlans;
