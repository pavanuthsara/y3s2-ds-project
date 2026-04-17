import { useState } from 'react';
import './SymptomChecker.css';

const SYMPTOM_SUGGESTIONS = [
  'fever',
  'cough',
  'sore throat',
  'headache',
  'fatigue',
  'body aches',
  'chills',
  'nasal congestion',
  'runny nose',
  'shortness of breath',
  'chest pain',
  'nausea',
  'vomiting',
  'diarrhea',
];

const DURATION_OPTIONS = [
  '1-2 days',
  '3-7 days',
  '1-2 weeks',
  '2-4 weeks',
  'more than 4 weeks',
];

const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe'];

const AGE_GROUPS = ['child', 'teenager', 'adult', 'senior'];

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SYMPTOM_SUGGESTIONS.filter(
    (symptom) =>
      symptom.toLowerCase().includes(symptomInput.toLowerCase()) &&
      !symptoms.includes(symptom)
  );

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setSymptomInput('');
      setShowSuggestions(false);
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleInputChange = (e) => {
    setSymptomInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleAddCustomSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      addSymptom(symptomInput.trim());
    }
  };

  const resetForm = () => {
    setSymptoms([]);
    setSymptomInput('');
    setDuration('');
    setSeverity('');
    setAgeGroup('');
    setAdditionalInfo('');
    setResult(null);
    setError('');
  };

  const analyzeSymptoms = async (e) => {
    e.preventDefault();

    if (!symptoms.length || !duration || !severity || !ageGroup) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Primary: Try direct service on port 8087
      let apiUrl = 'http://localhost:8087/api/symptoms/analyze';
      let headers = {
        'Content-Type': 'application/json',
      };

      const requestBody = {
        symptoms,
        duration,
        severity,
        ageGroup,
        additionalInfo,
      };

      let response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      // If direct service fails, try through API Gateway
      if (!response.ok && response.status !== 401) {
        console.log('Direct service failed, trying API Gateway...');
        apiUrl = 'http://localhost:8080/api/symptoms/analyze';
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${
            errorData || 'An error occurred while analyzing symptoms'
          }`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      let errorMsg = err.message;

      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        errorMsg =
          'Unable to connect to the backend service. Please ensure:\n' +
          '1. The backend services are running (docker-compose up)\n' +
          '2. The AI Symptom Checker service is running on localhost:8087';
      } else if (errorMsg.includes('401')) {
        errorMsg =
          'Authentication issue with API Gateway. Using direct service endpoint instead. ' +
          'If this persists, please restart the backend services.';
      } else if (errorMsg.includes('503') || errorMsg.includes('502')) {
        errorMsg =
          'Backend service is unavailable. Please ensure docker-compose services are running.';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Symptom Checker</h1>
          <p className="text-gray-600 text-lg">
            Get preliminary health suggestions based on your symptoms
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-sm text-yellow-800 font-semibold mb-1">⚠️ Medical Disclaimer</p>
          <p className="text-sm text-yellow-700">
            This AI-powered tool provides preliminary analysis only and should NOT replace professional
            medical consultation. Always consult with a qualified healthcare provider for proper diagnosis
            and treatment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <form onSubmit={analyzeSymptoms}>
                {/* Symptoms Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Symptoms <span className="text-red-600">*</span>
                  </label>

                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={handleInputChange}
                      placeholder="Type a symptom..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => addSymptom(suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Custom Button */}
                  {symptomInput.trim() && !filteredSuggestions.includes(symptomInput.trim()) && (
                    <button
                      type="button"
                      onClick={handleAddCustomSymptom}
                      className="w-full mb-3 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Add "{symptomInput}"
                    </button>
                  )}

                  {/* Selected Symptoms */}
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <div
                        key={symptom}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {symptom}
                        <button
                          type="button"
                          onClick={() => removeSymptom(symptom)}
                          className="hover:text-blue-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select duration...</option>
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Severity <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select severity...</option>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age Group */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age Group <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select age group...</option>
                    {AGE_GROUPS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Info */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any other relevant information..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
                {/* Conditions */}
                {result.conditions && result.conditions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Possible Conditions</h2>
                    <div className="space-y-4">
                      {result.conditions.map((condition, idx) => (
                        <div
                          key={idx}
                          className={`border-l-4 p-4 rounded ${
                            condition.severity === 'severe'
                              ? 'border-red-500 bg-red-50'
                              : condition.severity === 'moderate'
                                ? 'border-yellow-500 bg-yellow-50'
                                : 'border-green-500 bg-green-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {condition.name}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {condition.probability}% probability
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{condition.description}</p>
                          {condition.characteristics && condition.characteristics.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-semibold text-gray-600 mb-1">
                                Characteristics:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {condition.characteristics.map((char, i) => (
                                  <span
                                    key={i}
                                    className="bg-white px-2 py-1 rounded text-sm text-gray-700 border border-gray-200"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-600">
                            Severity: <span className="font-semibold capitalize">{condition.severity}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Specialties */}
                {result.recommendedSpecialties && result.recommendedSpecialties.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recommended Specialties</h2>
                    <div className="flex flex-wrap gap-3">
                      {result.recommendedSpecialties.map((specialty, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-blue-700 font-semibold"
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <h2 className="text-lg font-bold text-red-800 mb-3">⚠️ Warning Signs</h2>
                    <ul className="space-y-2">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className="text-red-700">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {result.nextSteps && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                    <h2 className="text-lg font-bold text-blue-800 mb-2">Next Steps</h2>
                    <p className="text-blue-700">{result.nextSteps}</p>
                  </div>
                )}

                {/* Disclaimer */}
                {result.disclaimer && (
                  <div className="bg-gray-100 border-l-4 border-gray-500 p-6 rounded-lg">
                    <p className="text-sm text-gray-700">{result.disclaimer}</p>
                  </div>
                )}

                {/* Confidence */}
                {result.confidence && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Analysis Confidence:{' '}
                      <span
                        className={`font-bold ${
                          result.confidence === 'high'
                            ? 'text-green-600'
                            : result.confidence === 'medium'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {result.confidence.toUpperCase()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Fill in the form and click "Analyze Symptoms" to get started.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-gray-600 mt-4">Analyzing your symptoms...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
