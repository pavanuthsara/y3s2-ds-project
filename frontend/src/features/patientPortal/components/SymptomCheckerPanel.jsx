import { useMemo, useState } from "react";
import { symptomAPI } from "../services/api";

const defaultForm = {
  symptomsText: "",
  duration: "1-3 days",
  severity: "mild",
  ageGroup: "adult",
  additionalInfo: "",
};

export function SymptomCheckerPanel() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const parsedSymptoms = useMemo(
    () =>
      form.symptomsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.symptomsText],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (parsedSymptoms.length === 0) {
      setError("Please enter at least one symptom.");
      return;
    }

    setLoading(true);

    try {
      const response = await symptomAPI.analyzeSymptoms({
        symptoms: parsedSymptoms,
        duration: form.duration,
        severity: form.severity,
        ageGroup: form.ageGroup,
        additionalInfo: form.additionalInfo,
      });

      setResult(response);
    } catch (err) {
      setError(err.message || "Unable to analyze symptoms right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          AI Symptom Checker
        </h2>
        <p className="mt-2 text-slate-600">
          Enter your symptoms for a preliminary suggestion. This is not a
          medical diagnosis.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold text-slate-900">Symptoms</p>
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="symptomsText"
            >
              Symptoms (comma separated)
            </label>
            <input
              id="symptomsText"
              name="symptomsText"
              value={form.symptomsText}
              onChange={handleChange}
              placeholder="fever, cough, headache"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Case Context
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="duration"
              >
                Duration
              </label>
              <select
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="less than 24 hours">Less than 24 hours</option>
                <option value="1-3 days">1-3 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="more than 1 week">More than 1 week</option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="severity"
              >
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="ageGroup"
              >
                Age Group
              </label>
              <select
                id="ageGroup"
                name="ageGroup"
                value={form.ageGroup}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="child">Child</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="additionalInfo"
            >
              Additional Info (optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={form.additionalInfo}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Any recent travel, allergies, or ongoing medication"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Possible Conditions
            </h3>
            {Array.isArray(result.conditions) &&
            result.conditions.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {result.conditions.map((condition, index) => (
                  <li
                    key={`${condition.name}-${index}`}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <p className="font-semibold text-gray-800">
                      {condition.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {condition.description}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Probability: {condition.probability ?? "N/A"}% | Severity:{" "}
                      {condition.severity || "N/A"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-2">
                No condition suggestions returned.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Recommended Specialties
            </h3>
            <p className="text-gray-700 mt-2">
              {Array.isArray(result.recommendedSpecialties) &&
              result.recommendedSpecialties.length > 0
                ? result.recommendedSpecialties.join(", ")
                : "Not provided"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Warnings</h3>
            {Array.isArray(result.warnings) && result.warnings.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 mt-2">No warning signs reported.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Next Steps</h3>
            <p className="text-gray-700 mt-2">
              {result.nextSteps || "Consult a doctor for professional advice."}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              {result.disclaimer ||
                "This is a preliminary analysis and not a diagnosis."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
