import { useState, useRef } from "react";
import { reportsAPI } from "../services/api";

export function FileUpload({ patientId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const dragOverRef = useRef(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }
    setFile(selectedFile);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragOverRef.current = false;
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = () => {
    dragOverRef.current = false;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await reportsAPI.uploadReport(
        patientId,
        file,
        description,
      );
      setSuccess(`File "${file.name}" uploaded successfully!`);
      setFile(null);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Upload Medical Report
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Attach a report file and add optional context for easier tracking.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <p className="mb-3 text-sm font-semibold text-slate-900">
            Choose File
          </p>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
              dragOverRef.current
                ? "border-sky-500 bg-sky-50"
                : file
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white hover:border-sky-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="block">
              <svg
                className="mx-auto mb-2 h-12 w-12 text-slate-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 4v12M26 10h12"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
              <p className="font-semibold text-slate-800">
                {file
                  ? `Selected: ${file.name}`
                  : "Drag and drop your file here"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                or click to select a file (Max 50MB)
              </p>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes about this report..."
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </section>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
}
