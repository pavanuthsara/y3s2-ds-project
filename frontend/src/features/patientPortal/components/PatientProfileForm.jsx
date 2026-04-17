const EMPTY_PROFILE_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  dateOfBirth: '',
};

export function createProfileFormState(profile) {
  if (!profile) {
    return EMPTY_PROFILE_FORM;
  }

  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phone: profile.phone || '',
    address: profile.address || '',
    dateOfBirth: profile.dateOfBirth || '',
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {profile ? 'Edit Your Profile' : 'Create Your Profile'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {profile
            ? 'Keep your patient details up to date for reports and appointments.'
            : 'Create your patient profile to unlock reports and the rest of the patient workspace.'}
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

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-2">First Name</span>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="firstName"
            onChange={onChange}
            required
            value={form.firstName}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-2">Last Name</span>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="lastName"
            onChange={onChange}
            required
            value={form.lastName}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-2">Phone</span>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="phone"
            onChange={onChange}
            value={form.phone}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</span>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="dateOfBirth"
            onChange={onChange}
            type="date"
            value={form.dateOfBirth}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="block text-sm font-medium text-gray-700 mb-2">Address</span>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="address"
            onChange={onChange}
            rows={3}
            value={form.address}
          />
        </label>

        <div className="md:col-span-2">
          <button
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Saving...' : profile ? 'Save Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
