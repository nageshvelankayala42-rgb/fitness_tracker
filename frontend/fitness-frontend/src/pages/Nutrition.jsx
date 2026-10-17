import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Nutrition.css";

const initialForm = {
  mealName: "",
  mealType: "Breakfast",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
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
  if (error.response.status === 400) return "The meal details are not valid. Please check the form and try again.";
  if (error.response.status === 404) return "That meal could not be found.";
  if (error.response.status >= 500) return "The server is unavailable right now. Please try again later.";
  return fallback;
}

function Nutrition() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState([]);
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

  const loadMeals = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const response = await axios.get("http://localhost:8080/api/nutrition");
      setMeals(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to load nutrition records. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios.get("http://localhost:8080/api/nutrition")
      .then((response) => { if (isMounted) setMeals(response.data); })
      .catch((error) => { if (isMounted) setPageError(getApiErrorMessage(error, "Unable to load nutrition records. Please try again.")); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const totals = meals.reduce((summary, meal) => ({
    calories: summary.calories + (Number(meal.calories) || 0),
    protein: summary.protein + (Number(meal.protein) || 0),
    carbs: summary.carbs + (Number(meal.carbs) || 0),
    fats: summary.fats + (Number(meal.fats) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    ["calories", "protein", "carbs", "fats"].forEach((field) => {
      if (form[field] === "" || Number.isNaN(Number(form[field])) || Number(form[field]) < 0) {
        errors[field] = "Enter a value of 0 or greater.";
      }
    });
    if (!form.mealName.trim()) errors.mealName = "Meal name is required.";
    if (!form.mealType) errors.mealType = "Meal type is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMeal = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setPageError("");
    try {
      await axios.post("http://localhost:8080/api/nutrition", {
        mealName: form.mealName.trim(), mealType: form.mealType,
        calories: Number(form.calories), protein: Number(form.protein),
        carbs: Number(form.carbs), fats: Number(form.fats),
      });
      setForm(initialForm);
      setFormErrors({});
      setShowForm(false);
      setSuccessMessage("Meal added successfully.");
      await loadMeals();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to add meal. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;
    setDeletingId(id);
    setPageError("");
    try {
      await axios.delete(`http://localhost:8080/api/nutrition/${id}`);
      setSuccessMessage("Meal deleted successfully.");
      await loadMeals();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to delete meal. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="nutrition-page">
      <div className="nutrition-shell">
        <header className="nutrition-header">
          <div className="nutrition-brand"><div className="nutrition-brand-mark">F</div><span>FITTRACK</span></div>
          <div className="nutrition-user"><div className="nutrition-welcome"><small>Fuel your progress</small><strong>Welcome back, {user?.name || "there"}</strong></div><div className="nutrition-avatar">{(user?.name || "F").charAt(0).toUpperCase()}</div></div>
        </header>
        <div className="nutrition-layout">
          <aside className="nutrition-sidebar"><ul className="nutrition-nav-list">
            {navItems.map(({ name, path, icon }) => <li key={name}><NavLink to={path} className={({ isActive }) => `nutrition-nav-item ${isActive ? "active" : ""}`}><span className="nutrition-nav-icon">{icon}</span>{name}</NavLink></li>)}
          </ul><button type="button" className="nutrition-nav-item nutrition-logout-item" onClick={logout}><span className="nutrition-nav-icon">↪</span>Logout</button></aside>
          <main className="nutrition-main">
            <div className="nutrition-page-heading"><div><span className="nutrition-eyebrow">Fuel your training</span><h1>Nutrition Management</h1><p>Track meals, stay consistent, and make every bite count.</p></div><button type="button" className="add-meal-button" onClick={() => setShowForm(true)}><span aria-hidden="true">+</span>Add Meal</button></div>
            {successMessage && <div className="nutrition-alert success" role="status"><span>✓</span>{successMessage}<button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss message">×</button></div>}
            {pageError && <div className="nutrition-alert error" role="alert"><span>!</span>{pageError}<button type="button" onClick={() => setPageError("")} aria-label="Dismiss message">×</button></div>}
            <section className="nutrition-summary" aria-label="Nutrition summary"><div className="summary-heading"><div><span className="nutrition-eyebrow">Daily overview</span><h2>Nutrition Summary</h2></div><span className="summary-caption">Across all logged meals</span></div><div className="summary-grid">
              <div className="summary-card calories"><span>Calories</span><strong>{totals.calories}</strong><small>kcal</small></div><div className="summary-card protein"><span>Protein</span><strong>{totals.protein}</strong><small>grams</small></div><div className="summary-card carbs"><span>Carbs</span><strong>{totals.carbs}</strong><small>grams</small></div><div className="summary-card fats"><span>Fats</span><strong>{totals.fats}</strong><small>grams</small></div>
            </div></section>
            <div className="meals-heading"><div><span className="nutrition-eyebrow">Your food log</span><h2>Logged Meals</h2></div>{!isLoading && <span className="meal-count">{meals.length} {meals.length === 1 ? "meal" : "meals"}</span>}</div>
            {isLoading && <p className="nutrition-state">Loading nutrition records...</p>}
            {!isLoading && !pageError && meals.length === 0 && <div className="nutrition-empty-state"><span className="empty-meal-icon">🥗</span><h2>No meals logged yet</h2><p>Add your first meal to start tracking your nutrition.</p><button type="button" className="secondary-meal-button" onClick={() => setShowForm(true)}>Add your first meal</button></div>}
            {!isLoading && !pageError && meals.length > 0 && <div className="meal-grid">{meals.map((meal) => <article className="nutrition-card" key={meal.id}><div className="meal-card-top"><div className="meal-icon">🍽</div><span className="meal-type">{meal.mealType}</span></div><h3>{meal.mealName}</h3><div className="meal-macro-grid"><div><span>Calories</span><strong>{meal.calories}<small> kcal</small></strong></div><div><span>Protein</span><strong>{meal.protein}<small> g</small></strong></div><div><span>Carbs</span><strong>{meal.carbs}<small> g</small></strong></div><div><span>Fats</span><strong>{meal.fats}<small> g</small></strong></div></div><button type="button" className="delete-meal-button" onClick={() => handleDeleteMeal(meal.id)} disabled={deletingId === meal.id}>{deletingId === meal.id ? "Deleting..." : "Delete Meal"}</button></article>)}</div>}
          </main>
        </div>
      </div>
      {showForm && <div className="nutrition-modal-backdrop"><div className="nutrition-modal" role="dialog" aria-modal="true" aria-labelledby="add-meal-title"><div className="modal-heading"><div><span className="nutrition-eyebrow">Build your plate</span><h2 id="add-meal-title">Add Meal</h2></div><button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close form">×</button></div><form className="nutrition-form" onSubmit={handleCreateMeal}>
        <label>Meal Name<input name="mealName" value={form.mealName} onChange={handleFormChange} placeholder="e.g. Greek Yogurt Bowl" />{formErrors.mealName && <span className="field-error">{formErrors.mealName}</span>}</label>
        <label>Meal Type<select name="mealType" value={form.mealType} onChange={handleFormChange}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select>{formErrors.mealType && <span className="field-error">{formErrors.mealType}</span>}</label>
        <div className="nutrition-form-grid"><label>Calories<input name="calories" type="number" min="0" value={form.calories} onChange={handleFormChange} placeholder="450" />{formErrors.calories && <span className="field-error">{formErrors.calories}</span>}</label><label>Protein (g)<input name="protein" type="number" min="0" value={form.protein} onChange={handleFormChange} placeholder="30" />{formErrors.protein && <span className="field-error">{formErrors.protein}</span>}</label><label>Carbs (g)<input name="carbs" type="number" min="0" value={form.carbs} onChange={handleFormChange} placeholder="45" />{formErrors.carbs && <span className="field-error">{formErrors.carbs}</span>}</label><label>Fats (g)<input name="fats" type="number" min="0" value={form.fats} onChange={handleFormChange} placeholder="15" />{formErrors.fats && <span className="field-error">{formErrors.fats}</span>}</label></div>
        <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="add-meal-button" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Meal"}</button></div>
      </form></div></div>}
    </div>
  );
}

export default Nutrition;
