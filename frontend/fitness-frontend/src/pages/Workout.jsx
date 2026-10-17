import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Workout.css";

const initialForm = {
  name: "",
  description: "",
  durationMinutes: "",
  caloriesBurned: "",
};

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

function getApiErrorMessage(error, fallback) {
  if (!error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  if (error.response.status === 400) {
    return "The workout details are not valid. Please check the form and try again.";
  }

  if (error.response.status === 404) {
    return "That workout could not be found.";
  }

  if (error.response.status >= 500) {
    return "The server is unavailable right now. Please try again later.";
  }

  return fallback;
}

function Workout() {
  const { user, logout } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!showForm && !selectedWorkout && !detailsError && !isLoadingDetails) return undefined;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setShowForm(false);
      setSelectedWorkout(null);
      setDetailsError("");
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showForm, selectedWorkout, detailsError, isLoadingDetails]);

  const loadWorkouts = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await axios.get("http://localhost:8080/api/workouts");
      setWorkouts(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to load workouts. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    axios.get("http://localhost:8080/api/workouts")
      .then((response) => {
        if (isMounted) {
          setWorkouts(response.data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setPageError(getApiErrorMessage(error, "Unable to load workouts. Please try again."));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    const duration = Number(form.durationMinutes);
    const calories = Number(form.caloriesBurned);

    if (!form.name.trim()) {
      errors.name = "Workout name is required.";
    }

    if (!form.description.trim()) {
      errors.description = "Description is required.";
    }

    if (!form.durationMinutes || Number.isNaN(duration) || duration <= 0) {
      errors.durationMinutes = "Duration must be greater than 0.";
    }

    if (
      form.caloriesBurned === ""
      || Number.isNaN(calories)
      || calories < 0
    ) {
      errors.caloriesBurned = "Calories must be 0 or greater.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleCreateWorkout = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setPageError("");

    try {
      await axios.post("http://localhost:8080/api/workouts", {
        name: form.name.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes),
        caloriesBurned: Number(form.caloriesBurned),
      });
      setForm(initialForm);
      setFormErrors({});
      setShowForm(false);
      setSuccessMessage("Workout added successfully.");
      await loadWorkouts();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to add workout. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    setDeletingId(id);
    setPageError("");

    try {
      await axios.delete(`http://localhost:8080/api/workouts/${id}`);
      setSuccessMessage("Workout deleted successfully.");
      await loadWorkouts();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to delete workout. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedWorkout(null);
    setDetailsError("");
    setIsLoadingDetails(true);

    try {
      const response = await axios.get(`http://localhost:8080/api/workouts/${id}`);
      setSelectedWorkout(response.data);
    } catch (error) {
      setDetailsError(getApiErrorMessage(error, "Unable to load workout details."));
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="workout-page">
      <div className="workout-shell">
        <header className="workout-header">
          <div className="workout-brand">
            <div className="workout-brand-mark">F</div>
            <span>FITTRACK</span>
          </div>

          <div className="workout-user">
            <div className="workout-welcome">
              <small>Training hub</small>
              <strong>Welcome back, {user?.name || "there"}</strong>
            </div>
            <div className="workout-avatar">{(user?.name || "F").charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="workout-layout">
          <aside className="workout-sidebar">
            <ul className="workout-nav-list">
              {navItems.map(({ name, path, icon }) => (
                <li key={name}>
                  <NavLink
                    to={path}
                    className={({ isActive }) => `workout-nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="workout-nav-icon">{icon}</span>
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>
            <button type="button" className="workout-nav-item workout-logout-item" onClick={logout}><span className="workout-nav-icon">↪</span>Logout</button>
          </aside>

          <main className="workout-main">
            <div className="workout-page-heading">
              <div>
                <span className="workout-eyebrow">Your training library</span>
                <h1>Workout Management</h1>
                <p>Plan, track and manage your training sessions.</p>
              </div>
              <button type="button" className="add-workout-button" onClick={() => setShowForm(true)}>
                <span aria-hidden="true">+</span>
                Add Workout
              </button>
            </div>

            {successMessage && (
              <div className="workout-alert success" role="status">
                <span aria-hidden="true">✓</span>
                {successMessage}
                <button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss message">×</button>
              </div>
            )}

            {pageError && (
              <div className="workout-alert error" role="alert">
                <span aria-hidden="true">!</span>
                {pageError}
                <button type="button" onClick={() => setPageError("")} aria-label="Dismiss message">×</button>
              </div>
            )}

            {isLoading && <p className="workout-state">Loading workouts...</p>}

            {!isLoading && !pageError && workouts.length === 0 && (
              <div className="workout-empty-state">
                <span className="empty-icon" aria-hidden="true">🏋️</span>
                <h2>No workouts yet</h2>
                <p>No workouts yet. Add your first workout to get started.</p>
                <button type="button" className="secondary-workout-button" onClick={() => setShowForm(true)}>
                  Add your first workout
                </button>
              </div>
            )}

            {!isLoading && !pageError && workouts.length > 0 && (
              <div className="workout-grid">
                {workouts.map((workout) => (
                  <article className="workout-card" key={workout.id}>
                    <div className="workout-card-top">
                      <div className="workout-card-icon" aria-hidden="true">⚡</div>
                      <span className="workout-card-label">Training session</span>
                    </div>
                    <h2>{workout.name}</h2>
                    <p className="workout-description">{workout.description}</p>

                    <div className="workout-card-metrics">
                      <div>
                        <span className="metric-label">Duration</span>
                        <strong>{workout.durationMinutes} <small>min</small></strong>
                      </div>
                      <div>
                        <span className="metric-label">Calories</span>
                        <strong>{workout.caloriesBurned} <small>kcal</small></strong>
                      </div>
                    </div>

                    <div className="workout-card-actions">
                      <button type="button" className="details-button" onClick={() => handleViewDetails(workout.id)}>
                        View Details
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        disabled={deletingId === workout.id}
                      >
                        {deletingId === workout.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {showForm && (
        <div className="workout-modal-backdrop" role="presentation">
          <div className="workout-modal" role="dialog" aria-modal="true" aria-labelledby="add-workout-title">
            <div className="modal-heading">
              <div>
                <span className="workout-eyebrow">Build your session</span>
                <h2 id="add-workout-title">Add Workout</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close form">×</button>
            </div>

            <form className="workout-form" onSubmit={handleCreateWorkout}>
              <label>
                Workout Name
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Lower Body Strength" />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </label>
              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Describe the focus of this session" rows="3" />
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </label>
              <div className="form-row">
                <label>
                  Duration (minutes)
                  <input name="durationMinutes" type="number" min="1" value={form.durationMinutes} onChange={handleFormChange} placeholder="60" />
                  {formErrors.durationMinutes && <span className="field-error">{formErrors.durationMinutes}</span>}
                </label>
                <label>
                  Calories Burned
                  <input name="caloriesBurned" type="number" min="0" value={form.caloriesBurned} onChange={handleFormChange} placeholder="450" />
                  {formErrors.caloriesBurned && <span className="field-error">{formErrors.caloriesBurned}</span>}
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="add-workout-button" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(isLoadingDetails || selectedWorkout || detailsError) && (
        <div className="workout-modal-backdrop" role="presentation">
          <div className="workout-modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
            <div className="modal-heading">
              <div>
                <span className="workout-eyebrow">Session overview</span>
                <h2 id="details-title">Workout Details</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => { setSelectedWorkout(null); setDetailsError(""); }} aria-label="Close details">×</button>
            </div>

            {isLoadingDetails && <p className="workout-state">Loading workout details...</p>}
            {detailsError && <p className="field-error details-error">{detailsError}</p>}
            {selectedWorkout && (
              <div className="details-content">
                <h3>{selectedWorkout.name}</h3>
                <p>{selectedWorkout.description}</p>
                <div className="detail-stat-row">
                  <div><span>Duration</span><strong>{selectedWorkout.durationMinutes} min</strong></div>
                  <div><span>Calories burned</span><strong>{selectedWorkout.caloriesBurned} kcal</strong></div>
                  <div><span>Workout ID</span><strong>#{selectedWorkout.id}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Workout;