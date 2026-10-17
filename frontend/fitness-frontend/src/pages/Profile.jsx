import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const initialForm = {
  name: "", email: "", phone: "", age: "", gender: "", weight: "", height: "",
  fitnessGoal: "", activityLevel: "", preferredWorkoutType: "",
};

const initialPasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };
const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▣" },
  { name: "Workouts", path: "/workouts", icon: "🏋️" },
  { name: "Nutrition", path: "/nutrition", icon: "🥗" },
  { name: "Progress", path: "/progress", icon: "📈" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

function apiError(error, fallback) {
  if (!error.response) return "Unable to connect to the server. Please try again.";
  if (error.response.status === 400) return "The submitted information is not valid.";
  if (error.response.status === 401) return "Current password is incorrect.";
  if (error.response.status === 404) return "Your profile could not be found.";
  if (error.response.status >= 500) return "The server is unavailable right now. Please try again later.";
  return fallback;
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [pageError, setPageError] = useState(userId ? "" : "Unable to identify your account. Please log in again.");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isEditing && !showPasswordModal) return undefined;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsEditing(false);
      setShowPasswordModal(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEditing, showPasswordModal]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let isMounted = true;
    Promise.all([
      axios.get(`http://localhost:8080/api/users/${userId}`),
      axios.get("http://localhost:8080/api/workouts"),
      axios.get("http://localhost:8080/api/progress"),
    ])
      .then(([profileResponse, workoutsResponse, progressResponse]) => {
        if (!isMounted) return;
        setProfile(profileResponse.data);
        setForm({ ...initialForm, ...profileResponse.data });
        setWorkouts(workoutsResponse.data);
        setProgressRecords(progressResponse.data);
      })
      .catch((error) => {
        if (isMounted) setPageError(apiError(error, "Unable to load your profile."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [userId]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address.";
    if (form.phone && !/^[+\d()\s-]{7,}$/.test(form.phone)) errors.phone = "Enter a valid phone number.";
    if (form.age && (Number(form.age) <= 0 || Number(form.age) > 120)) errors.age = "Enter a reasonable age.";
    if (form.weight && Number(form.weight) <= 0) errors.weight = "Weight must be positive.";
    if (form.height && Number(form.height) <= 0) errors.height = "Height must be positive.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;
    setIsUpdating(true);
    setPageError("");
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${userId}`, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone || null,
        age: form.age ? Number(form.age) : null, gender: form.gender || null,
        weight: form.weight ? Number(form.weight) : null, height: form.height ? Number(form.height) : null,
        fitnessGoal: form.fitnessGoal || null, activityLevel: form.activityLevel || null,
        preferredWorkoutType: form.preferredWorkoutType || null,
      });
      setProfile(response.data);
      setForm({ ...initialForm, ...response.data });
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setPageError(apiError(error, "Unable to update profile. Please try again."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required.";
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) errors.newPassword = "New password must be at least 6 characters.";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsChangingPassword(true);
    setPageError("");
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}/password`, {
        currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setPasswordErrors({});
      setShowPasswordModal(false);
      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      setPageError(apiError(error, "Unable to change password. Please try again."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const recentActivities = [
    ...workouts.slice(-3).map((workout) => ({ label: workout.name, detail: `${workout.durationMinutes} min workout`, icon: "🏋️" })),
    ...progressRecords.slice(-3).map((record) => ({ label: "Progress check-in", detail: `${record.weight} kg · ${record.workoutsCompleted} workouts`, icon: "📈" })),
  ].slice(-5).reverse();
  const totalCalories = workouts.reduce((sum, workout) => sum + (Number(workout.caloriesBurned) || 0), 0) + progressRecords.reduce((sum, record) => sum + (Number(record.caloriesBurned) || 0), 0);
  const latestProgress = progressRecords[progressRecords.length - 1];
  const firstLetter = (profile?.name || "F").charAt(0).toUpperCase();

  if (isLoading) return <div className="profile-loading">Loading your profile...</div>;

  return (
    <>
    <div className="profile-page"><div className="profile-shell">
      <header className="profile-header"><div className="profile-brand"><div className="profile-brand-mark">F</div><span>FITTRACK</span></div><div className="profile-user"><div className="profile-welcome"><small>Your personal space</small><strong>Welcome back, {profile?.name || "Nagesh"}</strong></div><div className="profile-avatar-small">{firstLetter}</div></div></header>
      <div className="profile-layout"><aside className="profile-sidebar"><ul className="profile-nav-list">{navItems.map(({ name, path, icon }) => <li key={name}><NavLink to={path} className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}><span className="profile-nav-icon">{icon}</span>{name}</NavLink></li>)}</ul><button type="button" className="profile-nav-item profile-logout-item" onClick={logout}><span className="profile-nav-icon">↪</span>Logout</button></aside>
        <main className="profile-main"><div className="profile-page-heading"><div><span className="profile-eyebrow">Your fitness identity</span><h1>Profile</h1><p>Manage your details and keep your goals close.</p></div><button type="button" className="edit-profile-button" onClick={() => setIsEditing(true)}>Edit Profile</button></div>
          {successMessage && <div className="profile-alert success" role="status"><span>✓</span>{successMessage}<button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss message">×</button></div>}
          {pageError && <div className="profile-alert error" role="alert"><span>!</span>{pageError}<button type="button" onClick={() => setPageError("")} aria-label="Dismiss message">×</button></div>}
          {!profile ? <div className="profile-empty"><h2>Profile unavailable</h2><p>We could not load your account details.</p><button type="button" onClick={() => navigate("/login")}>Return to Login</button></div> : <>
            <section className="profile-hero"><div className="profile-avatar-large">{firstLetter}</div><div><span className="profile-eyebrow">Fitness member</span><h2>{profile.name}</h2><p>{profile.email}</p></div><span className="member-status">Active member</span></section>
            <div className="profile-stat-grid"><div><span>Total Workouts</span><strong>{workouts.length}</strong><small>sessions logged</small></div><div><span>Current Weight</span><strong>{profile.weight ? `${profile.weight} kg` : "--"}</strong><small>latest profile value</small></div><div><span>Calories Burned</span><strong>{totalCalories.toLocaleString()}</strong><small>tracked total</small></div><div><span>Workout Streak</span><strong>Unavailable</strong><small>Workout dates are not recorded</small></div></div>
            <div className="profile-content-grid"><section className="profile-card"><div className="card-heading"><div><span className="profile-eyebrow">The essentials</span><h2>Personal Information</h2></div><button type="button" className="text-button" onClick={() => setIsEditing(true)}>Edit</button></div><div className="info-grid"><div><span>Full Name</span><strong>{profile.name}</strong></div><div><span>Email</span><strong>{profile.email}</strong></div><div><span>Phone Number</span><strong>{profile.phone || "Not added"}</strong></div><div><span>Age</span><strong>{profile.age || "Not added"}</strong></div><div><span>Gender</span><strong>{profile.gender || "Not added"}</strong></div></div></section>
              <section className="profile-card"><div className="card-heading"><div><span className="profile-eyebrow">Train with intent</span><h2>Fitness Information</h2></div><button type="button" className="text-button" onClick={() => setIsEditing(true)}>Edit</button></div><div className="info-grid"><div><span>Current Weight</span><strong>{profile.weight ? `${profile.weight} kg` : "Not added"}</strong></div><div><span>Height</span><strong>{profile.height ? `${profile.height} cm` : "Not added"}</strong></div><div><span>Fitness Goal</span><strong>{profile.fitnessGoal || "Not added"}</strong></div><div><span>Activity Level</span><strong>{profile.activityLevel || "Not added"}</strong></div><div><span>Preferred Workout</span><strong>{profile.preferredWorkoutType || "Not added"}</strong></div></div></section></div>
            <div className="profile-lower-grid"><section className="profile-card account-card"><div className="card-heading"><div><span className="profile-eyebrow">Account</span><h2>Account Information</h2></div></div><div className="account-list"><div><span>Status</span><strong className="verified">● Active</strong></div><div><span>Member since</span><strong>Fitness Tracker member</strong></div><div><span>Email verification</span><strong className="verified">● Verified</strong></div></div><button type="button" className="password-button" onClick={() => setShowPasswordModal(true)}>Change Password</button></section><section className="profile-card"><div className="card-heading"><div><span className="profile-eyebrow">Your latest effort</span><h2>Recent Activity</h2></div></div>{recentActivities.length === 0 ? <p className="muted-text">No recent activity available.</p> : <div className="activity-list">{recentActivities.map((activity, index) => <div className="activity-row" key={`${activity.label}-${index}`}><span>{activity.icon}</span><div><strong>{activity.label}</strong><small>{activity.detail}</small></div></div>)}</div>}</section></div>
            {latestProgress && <section className="latest-note"><span className="profile-eyebrow">Latest progress note</span><p>{latestProgress.notes || "Keep showing up. Your consistency is the real win."}</p></section>}
          </>}
        </main>
      </div>
    </div></div>
    {isEditing && <div className="profile-modal-backdrop"><div className="profile-form-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><div className="modal-heading"><div><span className="profile-eyebrow">Make it yours</span><h2 id="edit-profile-title">Edit Profile</h2></div><button type="button" className="modal-close" onClick={() => setIsEditing(false)} aria-label="Close form">×</button></div><form className="profile-form" onSubmit={handleUpdateProfile}>
      <div className="profile-form-grid"><label>Full Name<input name="name" value={form.name} onChange={handleFormChange} />{formErrors.name && <span className="field-error">{formErrors.name}</span>}</label><label>Email<input name="email" type="email" value={form.email} onChange={handleFormChange} />{formErrors.email && <span className="field-error">{formErrors.email}</span>}</label><label>Phone Number<input name="phone" value={form.phone || ""} onChange={handleFormChange} />{formErrors.phone && <span className="field-error">{formErrors.phone}</span>}</label><label>Age<input name="age" type="number" value={form.age || ""} onChange={handleFormChange} />{formErrors.age && <span className="field-error">{formErrors.age}</span>}</label><label>Gender<input name="gender" value={form.gender || ""} onChange={handleFormChange} /></label><label>Current Weight (kg)<input name="weight" type="number" step="0.1" value={form.weight || ""} onChange={handleFormChange} />{formErrors.weight && <span className="field-error">{formErrors.weight}</span>}</label><label>Height (cm)<input name="height" type="number" step="0.1" value={form.height || ""} onChange={handleFormChange} />{formErrors.height && <span className="field-error">{formErrors.height}</span>}</label><label>Fitness Goal<input name="fitnessGoal" value={form.fitnessGoal || ""} onChange={handleFormChange} /></label><label>Activity Level<input name="activityLevel" value={form.activityLevel || ""} onChange={handleFormChange} /></label><label>Preferred Workout Type<input name="preferredWorkoutType" value={form.preferredWorkoutType || ""} onChange={handleFormChange} /></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button><button type="submit" className="edit-profile-button" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</button></div>
    </form></div></div>}
    {showPasswordModal && <div className="profile-modal-backdrop"><div className="profile-form-modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title"><div className="modal-heading"><div><span className="profile-eyebrow">Account security</span><h2 id="password-title">Change Password</h2></div><button type="button" className="modal-close" onClick={() => setShowPasswordModal(false)} aria-label="Close password form">×</button></div><form className="profile-form" onSubmit={handlePasswordChange}><label>Current Password<input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />{passwordErrors.currentPassword && <span className="field-error">{passwordErrors.currentPassword}</span>}</label><label>New Password<input type="password" name="newPassword" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />{passwordErrors.newPassword && <span className="field-error">{passwordErrors.newPassword}</span>}</label><label>Confirm New Password<input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} />{passwordErrors.confirmPassword && <span className="field-error">{passwordErrors.confirmPassword}</span>}</label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowPasswordModal(false)}>Cancel</button><button type="submit" className="edit-profile-button" disabled={isChangingPassword}>{isChangingPassword ? "Updating..." : "Update Password"}</button></div></form></div></div>}
    </>
  );
}

export default Profile;
