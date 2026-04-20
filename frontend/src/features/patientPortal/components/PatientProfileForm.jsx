const EMPTY_PROFILE_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  dateOfBirth: "",
};

export function createProfileFormState(profile) {
  if (!profile) {
    return EMPTY_PROFILE_FORM;
  }

  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    phone: profile.phone || "",
    address: profile.address || "",
    dateOfBirth: profile.dateOfBirth || "",
  };
}

export function PatientProfileForm({
  profile,
  form,
  busy,
  error,
  message,
  onChange,
  onSubmit,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {profile ? "Edit Your Profile" : "Create Your Profile"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {profile
            ? "Keep your patient details up to date for reports and appointments."
            : "Create your patient profile to unlock reports and the rest of the patient workspace."}
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Basic Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                First Name
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="firstName"
                onChange={onChange}
                required
                value={form.firstName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Last Name
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="lastName"
                onChange={onChange}
                required
                value={form.lastName}
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Contact And Identity
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="phone"
                onChange={onChange}
                value={form.phone}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Date of Birth
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="dateOfBirth"
                onChange={onChange}
                type="date"
                value={form.dateOfBirth}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Address
              </span>
              <textarea
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="address"
                onChange={onChange}
                rows={3}
                value={form.address}
              />
            </label>
          </div>
        </section>

        <div>
          <button
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            disabled={busy}
            type="submit"
          >
            {busy ? "Saving..." : profile ? "Save Profile" : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
