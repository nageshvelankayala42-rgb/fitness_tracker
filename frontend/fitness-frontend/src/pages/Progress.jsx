import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Progress.css";

const initialForm = {
  weight: "",
  caloriesBurned: "",
  workoutsCompleted: "",
  notes: "",
};

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

function getApiErrorMessage(error, fallback) {
  if (!error.response) return "Unable to connect to the server. Please try again.";
  if (error.response.status === 400) return "The progress details are not valid. Please check the form and try again.";
  if (error.response.status === 404) return "That progress record could not be found.";
  if (error.response.status >= 500) return "The server is unavailable right now. Please try again later.";
  return fallback;
}

function Progress() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!showForm) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowForm(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showForm]);

  const loadRecords = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const response = await axios.get("http://localhost:8080/api/progress");
      setRecords(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to load progress records. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios.get("http://localhost:8080/api/progress")
      .then((response) => { if (isMounted) setRecords(response.data); })
      .catch((error) => { if (isMounted) setPageError(getApiErrorMessage(error, "Unable to load progress records. Please try again.")); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const sortedRecords = [...records].sort((first, second) => (first.id ?? 0) - (second.id ?? 0));
  const latestRecord = sortedRecords[sortedRecords.length - 1];
  const previousRecord = sortedRecords[sortedRecords.length - 2];
  const currentWeight = latestRecord?.weight ?? 0;
  const weightChange = latestRecord && previousRecord ? currentWeight - previousRecord.weight : 0;
  const totalWorkouts = records.reduce((total, record) => total + (Number(record.workoutsCompleted) || 0), 0);
  const totalCalories = records.reduce((total, record) => total + (Number(record.caloriesBurned) || 0), 0);
  const maxWeight = Math.max(...records.map((record) => Number(record.weight) || 0), 1);
  const minWeight = Math.min(...records.map((record) => Number(record.weight) || maxWeight), maxWeight);
  const weightRange = Math.max(maxWeight - minWeight, 1);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const weight = Number(form.weight);
    const calories = Number(form.caloriesBurned);
    const workouts = Number(form.workoutsCompleted);
    if (form.weight === "" || Number.isNaN(weight) || weight <= 0) errors.weight = "Weight must be greater than 0.";
    if (form.caloriesBurned === "" || Number.isNaN(calories) || calories < 0) errors.caloriesBurned = "Calories must be 0 or greater.";
    if (form.workoutsCompleted === "" || Number.isNaN(workouts) || workouts < 0 || !Number.isInteger(workouts)) errors.workoutsCompleted = "Enter a whole number of 0 or greater.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setPageError("");
    try {
      await axios.post("http://localhost:8080/api/progress", {
        weight: Number(form.weight),
        caloriesBurned: Number(form.caloriesBurned),
        workoutsCompleted: Number(form.workoutsCompleted),
        notes: form.notes.trim(),
      });
      setForm(initialForm);
      setFormErrors({});
      setShowForm(false);
      setSuccessMessage("Progress record added successfully.");
      await loadRecords();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to add progress record. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this progress record?")) return;
    setDeletingId(id);
    setPageError("");
    try {
      await axios.delete(`http://localhost:8080/api/progress/${id}`);
      setSuccessMessage("Progress record deleted successfully.");
      await loadRecords();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to delete progress record. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="progress-page">
      <div className="progress-shell">
        <header className="progress-header">
          <div className="progress-brand"><div className="progress-brand-mark">F</div><span>FITTRACK</span></div>
          <div className="progress-user"><div className="progress-welcome"><small>Keep moving forward</small><strong>Welcome back, {user?.name || "there"}</strong></div><div className="progress-avatar">{(user?.name || "F").charAt(0).toUpperCase()}</div></div>
        </header>
        <div className="progress-layout">
          <aside className="progress-sidebar"><ul className="progress-nav-list">
            {navItems.map(({ name, path, icon }) => <li key={name}><NavLink to={path} className={({ isActive }) => `progress-nav-item ${isActive ? "active" : ""}`}><span className="progress-nav-icon">{icon}</span>{name}</NavLink></li>)}
          </ul><button type="button" className="progress-nav-item progress-logout-item" onClick={logout}><span className="progress-nav-icon">↪</span>Logout</button></aside>
          <main className="progress-main">
            <div className="progress-page-heading"><div><span className="progress-eyebrow">Measure your momentum</span><h1>Progress</h1><p>Track the work, celebrate the wins, and keep your next goal in sight.</p></div><button type="button" className="add-progress-button" onClick={() => setShowForm(true)}><span>+</span>Add Progress</button></div>
            {successMessage && <div className="progress-alert success" role="status"><span>✓</span>{successMessage}<button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss message">×</button></div>}
            {pageError && <div className="progress-alert error" role="alert"><span>!</span>{pageError}<button type="button" onClick={() => setPageError("")} aria-label="Dismiss message">×</button></div>}
            <section className="progress-stats" aria-label="Progress summary">
              <div className="progress-stat-card weight"><span>Current Weight</span><strong>{currentWeight.toFixed(1)}<small> kg</small></strong><em>{weightChange === 0 ? "No change recorded" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg since last entry`}</em></div>
              <div className="progress-stat-card change"><span>Weight Change</span><strong>{weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)}<small> kg</small></strong><em>{weightChange <= 0 ? "Moving in the right direction" : "Keep focused on your plan"}</em></div>
              <div className="progress-stat-card workouts"><span>Workout Count</span><strong>{totalWorkouts}</strong><em>Completed across records</em></div>
              <div className="progress-stat-card calories"><span>Calories Burned</span><strong>{totalCalories.toLocaleString()}</strong><em>Total logged burn</em></div>
            </section>
            {isLoading && <p className="progress-state">Loading progress records...</p>}
            {!isLoading && !pageError && records.length === 0 && <div className="progress-empty"><span>📈</span><h2>No progress records yet</h2><p>Add your first record to start seeing your momentum.</p><button type="button" className="secondary-progress-button" onClick={() => setShowForm(true)}>Add your first record</button></div>}
            {!isLoading && !pageError && records.length > 0 && <>
+              <div className="progress-content-grid"><section className="progress-panel"><div className="panel-heading"><div><span className="progress-eyebrow">Latest check-in</span><h2>Latest Progress</h2></div><span className="latest-badge">Current</span></div><div className="latest-content"><div className="latest-weight"><strong>{Number(latestRecord.weight).toFixed(1)}</strong><span>kg</span></div><div className="latest-details"><p>{latestRecord.notes || "No notes added for this record."}</p><div><span>{latestRecord.workoutsCompleted} workouts</span><span>{latestRecord.caloriesBurned.toLocaleString()} kcal burned</span></div></div></div></section><section className="progress-panel"><div className="panel-heading"><div><span className="progress-eyebrow">Visual trend</span><h2>Weight Progress</h2></div><span className="latest-badge">{records.length} entries</span></div><div className="weight-visual">{sortedRecords.slice(-8).map((record) => { const height = `${Math.max(18, ((Number(record.weight) - minWeight) / weightRange) * 70 + 20)}%`; return <div className="weight-point" key={record.id}><span style={{ height }}></span><small>{Number(record.weight).toFixed(1)}</small></div>; })}</div></section></div>
+              <section className="progress-history"><div className="panel-heading"><div><span className="progress-eyebrow">Your record</span><h2>Progress History</h2></div><span className="latest-badge">{records.length} records</span></div><div className="history-list">{[...sortedRecords].reverse().map((record) => <div className="history-row" key={record.id}><div className="history-icon">↗</div><div className="history-main"><strong>{Number(record.weight).toFixed(1)} kg</strong><span>{record.notes || "Progress check-in"}</span></div><div className="history-metrics"><span>{record.workoutsCompleted} workouts</span><span>{record.caloriesBurned.toLocaleString()} kcal</span></div><button type="button" className="delete-progress-button" onClick={() => handleDeleteRecord(record.id)} disabled={deletingId === record.id}>{deletingId === record.id ? "Deleting..." : "Delete"}</button></div>)}</div></section>
+            </>}
          </main>
        </div>
      </div>
      {showForm && <div className="progress-modal-backdrop"><div className="progress-modal" role="dialog" aria-modal="true" aria-labelledby="add-progress-title"><div className="modal-heading"><div><span className="progress-eyebrow">Log the work</span><h2 id="add-progress-title">Add Progress</h2></div><button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close form">×</button></div><form className="progress-form" onSubmit={handleCreateRecord}>
+        <label>Weight (kg)<input name="weight" type="number" min="0.1" step="0.1" value={form.weight} onChange={handleFormChange} placeholder="72.4" />{formErrors.weight && <span className="field-error">{formErrors.weight}</span>}</label>
+        <div className="progress-form-grid"><label>Calories Burned<input name="caloriesBurned" type="number" min="0" value={form.caloriesBurned} onChange={handleFormChange} placeholder="450" />{formErrors.caloriesBurned && <span className="field-error">{formErrors.caloriesBurned}</span>}</label><label>Workouts Completed<input name="workoutsCompleted" type="number" min="0" step="1" value={form.workoutsCompleted} onChange={handleFormChange} placeholder="3" />{formErrors.workoutsCompleted && <span className="field-error">{formErrors.workoutsCompleted}</span>}</label></div>
+        <label>Notes <span className="optional-label">Optional</span><textarea name="notes" value={form.notes} onChange={handleFormChange} rows="3" placeholder="How are you feeling this week?" /></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="add-progress-button" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Progress"}</button></div>
+      </form></div></div>}
    </div>
  );
}

export default Progress;
