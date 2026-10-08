"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProblemForm({ 
  initialData, 
  isNew 
}: { 
  initialData?: any, 
  isNew: boolean 
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "EASY",
    tags: initialData?.tags ? initialData.tags.join(", ") : "",
    timeLimitMs: initialData?.timeLimitMs || 2000,
    memoryLimitMb: initialData?.memoryLimitMb || 256,
  });

  const [testCases, setTestCases] = useState<any[]>(initialData?.testCases || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setIssues([]);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t),
        testCases: testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          isHidden: tc.isHidden,
        })),
      };

      const url = isNew ? "/api/admin/problems" : `/api/admin/problems/${initialData.slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.issues) {
          setIssues(data.issues);
        } else {
          setError(data.error || "Failed to save");
        }
      } else {
        router.push("/admin/problems");
        router.refresh();
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isSample: false, isHidden: true }]);
  };

  const updateTestCase = (index: number, field: string, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {isNew ? "Create Problem" : "Edit Problem"}
      </h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {issues.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul className="list-disc pl-5">
            {issues.map((iss, i) => (
              <li key={i}>{iss.path.join(".")} - {iss.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
            <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Markdown)</label>
          <textarea required rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border font-mono text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
            <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border">
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (ms)</label>
            <input type="number" required min="100" value={formData.timeLimitMs} onChange={e => setFormData({...formData, timeLimitMs: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Memory Limit (MB)</label>
            <input type="number" required min="16" value={formData.memoryLimitMb} onChange={e => setFormData({...formData, memoryLimitMb: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2 border" />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Cases</h2>
            <button type="button" onClick={addTestCase} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Add Test Case</button>
          </div>
          
          {testCases.length === 0 && <p className="text-gray-500 text-sm">No test cases added yet.</p>}

          <div className="space-y-4">
            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Test Case #{idx + 1}</span>
                  <button type="button" onClick={() => removeTestCase(idx)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Input</label>
                    <textarea required rows={3} value={tc.input} onChange={e => updateTestCase(idx, "input", e.target.value)} className="mt-1 w-full text-sm font-mono p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Expected Output</label>
                    <textarea required rows={3} value={tc.expectedOutput} onChange={e => updateTestCase(idx, "expectedOutput", e.target.value)} className="mt-1 w-full text-sm font-mono p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(idx, "isSample", e.target.checked)} className="rounded text-blue-600" />
                    Is Sample
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(idx, "isHidden", e.target.checked)} className="rounded text-blue-600" />
                    Is Hidden
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button type="button" onClick={() => router.push("/admin/problems")} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}
