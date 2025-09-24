"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Code2, Check, X, Copy, Download, Minimize, Maximize } from "lucide-react";

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const formatJSON = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(null);
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError("");
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(null);
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError("");
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const downloadJSON = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'formatted.json';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError("");
  };

  const loadSample = () => {
    const sampleJSON = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "skills": ["JavaScript", "React", "Node.js"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  },
  "active": true
}`;
    setInput(sampleJSON.replace(/\n  /g, '').replace(/\n/g, ''));
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and minify JSON data with syntax highlighting"
    >
      <div className="space-y-6">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={formatJSON}
            disabled={!input.trim()}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Maximize size={18} />
            <span>Format</span>
          </button>
          
          <button
            onClick={minifyJSON}
            disabled={!input.trim()}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Minimize size={18} />
            <span>Minify</span>
          </button>

          <button
            onClick={loadSample}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Code2 size={18} />
            <span>Load Sample</span>
          </button>

          <button
            onClick={clearAll}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <X size={18} />
            <span>Clear</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input JSON</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm resize-none"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Output
                {isValid === true && (
                  <span className="ml-2 inline-flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Check size={16} />
                    <span className="text-sm">Valid JSON</span>
                  </span>
                )}
                {isValid === false && (
                  <span className="ml-2 inline-flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <X size={16} />
                    <span className="text-sm">Invalid JSON</span>
                  </span>
                )}
              </h3>
              
              {output && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                    <span className="text-sm">{isCopied ? "Copied!" : "Copy"}</span>
                  </button>
                  
                  <button
                    onClick={downloadJSON}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    title="Download JSON file"
                  >
                    <Download size={16} />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <textarea
                value={output}
                readOnly
                placeholder={error || "Formatted JSON will appear here..."}
                className={`w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none ${
                  error
                    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                } placeholder-gray-500 dark:placeholder-gray-400`}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <X className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">JSON Validation Error</h4>
                <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* JSON Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Code2 className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">JSON Tips</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use double quotes for strings, not single quotes</li>
                <li>• Property names must be in double quotes</li>
                <li>• No trailing commas allowed</li>
                <li>• Numbers, booleans, and null don&apos;t need quotes</li>
                <li>• Use the Format button to make JSON readable</li>
                <li>• Use the Minify button to reduce file size</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}