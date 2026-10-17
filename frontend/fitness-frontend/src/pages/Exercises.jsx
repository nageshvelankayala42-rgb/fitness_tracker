import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Exercises.css";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Exercises", path: "/exercises", icon: "💪" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

const filters = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

const exercises = [
  {
    name: "Bench Press",
    category: "Chest",
    target: "Chest, Triceps",
    difficulty: "Intermediate",
    equipment: "Barbell",
    sets: 4,
    reps: 8,
    icon: "🏋️",
  },
  {
    name: "Squats",
    category: "Legs",
    target: "Quads, Glutes",
    difficulty: "Advanced",
    equipment: "Barbell",
    sets: 5,
    reps: 6,
    icon: "🦵",
  },
  {
    name: "Deadlift",
    category: "Back",
    target: "Hamstrings, Back",
    difficulty: "Advanced",
    equipment: "Barbell",
    sets: 4,
    reps: 6,
    icon: "💥",
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    target: "Lats, Biceps",
    difficulty: "Intermediate",
    equipment: "Cable Machine",
    sets: 4,
    reps: 10,
    icon: "🏆",
  },
  {
    name: "Shoulder Press",
    category: "Shoulders",
    target: "Shoulders, Triceps",
    difficulty: "Intermediate",
    equipment: "Dumbbells",
    sets: 4,
    reps: 10,
    icon: "💪",
  },
  {
    name: "Bicep Curl",
    category: "Arms",
    target: "Biceps",
    difficulty: "Beginner",
    equipment: "Dumbbells",
    sets: 3,
    reps: 12,
    icon: "🔥",
  },
  {
    name: "Tricep Pushdown",
    category: "Arms",
    target: "Triceps",
    difficulty: "Beginner",
    equipment: "Cable Machine",
    sets: 3,
    reps: 12,
    icon: "⚡",
  },
  {
    name: "Plank",
    category: "Core",
    target: "Core, Abs",
    difficulty: "Beginner",
    equipment: "Bodyweight",
    sets: 3,
    reps: 45,
    icon: "🧘",
  },
];

function Exercises() {
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState("");

  const filteredExercises =
    activeCategory === "All"
      ? exercises
      : exercises.filter((exercise) => exercise.category === activeCategory);

  return (
    <div className="exercises-page">
      <div className="fitness-shell">
        <header className="fitness-header">
          <div className="header-brand">
            <div className="header-brand-mark">F</div>
            <div className="header-brand-text">FITTRACK</div>
          </div>

          <div className="header-user">
            <div className="welcome-text">
              <small>Welcome</small>
              <strong>Welcome back, {user?.name || "there"}!</strong>
            </div>
            <div className="user-avatar">N</div>
            <button type="button" className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <div className="fitness-body">
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
            <button type="button" className="nav-item logout-nav-item" onClick={logout}><span className="nav-icon">↪</span>Logout</button>
          </aside>

          <main className="main-panel">
            <div className="page-header">
              <h1>Exercises</h1>
            </div>

            <div className="filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-btn ${activeCategory === filter ? "active" : ""}`}
                  onClick={() => setActiveCategory(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="exercise-grid">
              {filteredExercises.map((exercise) => (
                <article className="exercise-card" key={exercise.name}>
                  <div className="exercise-top">
                    <div className="exercise-icon">{exercise.icon}</div>
                    <span className="exercise-tag">{exercise.category}</span>
                  </div>

                  <h3>{exercise.name}</h3>

                  <div className="exercise-meta">
                    <div className="meta-item">
                      <span className="meta-label">Target</span>
                      <span className="meta-value">{exercise.target}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Difficulty</span>
                      <span className="meta-value">{exercise.difficulty}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Equipment</span>
                      <span className="meta-value">{exercise.equipment}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Sets / Reps</span>
                      <span className="meta-value">
                        {exercise.sets} x {exercise.reps}
                      </span>
                    </div>
                  </div>

                  <button type="button" className="plan-btn" onClick={() => setSelectedExercise(exercise.name)}>
                    {selectedExercise === exercise.name ? "Exercise Selected" : "View Exercise"}
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

export default Exercises;
