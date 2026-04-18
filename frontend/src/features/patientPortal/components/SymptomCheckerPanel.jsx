import { useMemo, useState } from 'react';
import { symptomAPI } from '../services/api';

const defaultForm = {
  symptomsText: '',
  duration: '1-3 days',
  severity: 'mild',
  ageGroup: 'adult',
  additionalInfo: '',
};

export function SymptomCheckerPanel() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const parsedSymptoms = useMemo(
    () => form.symptomsText.split(',').map((item) => item.trim()).filter(Boolean),
    [form.symptomsText],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (parsedSymptoms.length === 0) {
      setError('Please enter at least one symptom.');
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
      setError(err.message || 'Unable to analyze symptoms right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">AI Symptom Checker</h2>
        <p className="text-gray-600 mt-2">
          Enter your symptoms for a preliminary suggestion. This is not a medical diagnosis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="symptomsText">
            Symptoms (comma separated)
          </label>
          <input
            id="symptomsText"
            name="symptomsText"
            value={form.symptomsText}
            onChange={handleChange}
            placeholder="fever, cough, headache"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="duration">
              Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="less than 24 hours">Less than 24 hours</option>
              <option value="1-3 days">1-3 days</option>
              <option value="3-7 days">3-7 days</option>
              <option value="more than 1 week">More than 1 week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="severity">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="ageGroup">
              Age Group
            </label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={form.ageGroup}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="child">Child</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="additionalInfo">
            Additional Info (optional)
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={form.additionalInfo}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Any recent travel, allergies, or ongoing medication"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Possible Conditions</h3>
            {Array.isArray(result.conditions) && result.conditions.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {result.conditions.map((condition, index) => (
                  <li key={`${condition.name}-${index}`} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-gray-800">{condition.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Probability: {condition.probability ?? 'N/A'}% | Severity: {condition.severity || 'N/A'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-2">No condition suggestions returned.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recommended Specialties</h3>
            <p className="text-gray-700 mt-2">
              {Array.isArray(result.recommendedSpecialties) && result.recommendedSpecialties.length > 0
                ? result.recommendedSpecialties.join(', ')
                : 'Not provided'}
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
            <p className="text-gray-700 mt-2">{result.nextSteps || 'Consult a doctor for professional advice.'}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              {result.disclaimer || 'This is a preliminary analysis and not a diagnosis.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
