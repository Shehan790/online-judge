"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";

const starterCode: Record<string, string> = {
  javascript: "function solve(input) {\n  // Your code here\n}\n",
  python: "def solve(input):\n    # Your code here\n    pass\n",
  java: "class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n",
};

export default function EditorComponent({ slug }: { slug: string }) {
  const router = useRouter();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode["javascript"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(starterCode[lang] || "");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, language, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setError(data.issues.map((iss: any) => iss.message).join(", "));
        } else {
          setError(data.error || "Submission failed");
        }
      } else {
        router.push(`/submissions/${data.id}`);
        router.refresh();
      }
    } catch (e) {
      setError("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-t-lg border border-gray-200 dark:border-gray-700">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 text-sm mb-2 rounded">
          {error}
        </div>
      )}

      <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden min-h-[400px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}
