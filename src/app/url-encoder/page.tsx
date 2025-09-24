"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Download, ArrowRight, Link as LinkIcon } from "lucide-react";

export default function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (!value.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeURIComponent(value);
        setOutput(encoded);
        setError("");
      } else {
        const decoded = decodeURIComponent(value);
        setOutput(decoded);
        setError("");
      }
    } catch (err) {
      setError(mode === "decode" ? "Invalid URL encoded string" : "Encoding failed");
      setOutput("");
    }
  };

  const switchMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    
    // If there's output, make it the new input
    if (output && !error) {
      setInput(output);
      setOutput(input);
    }
    
    setError("");
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

  const downloadOutput = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = mode === "encode" ? 'url-encoded.txt' : 'url-decoded.txt';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const loadSample = () => {
    if (mode === "encode") {
      setInput("Hello World! How are you today? Let's test URL encoding with special characters: @#$%^&*()+={}[]|\\:;\"'<>,.?/~`");
    } else {
      setInput("Hello%20World%21%20How%20are%20you%20today%3F%20Let%27s%20test%20URL%20encoding%20with%20special%20characters%3A%20%40%23%24%25%5E%26*()%2B%3D%7B%7D%5B%5D%7C%5C%3A%3B%22%27%3C%3E%2C.%3F%2F~%60");
    }
  };

  const encodeFullURL = () => {
    if (input.trim()) {
      try {
        const encoded = encodeURI(input);
        setOutput(encoded);
        setError("");
      } catch (err) {
        setError("Failed to encode URL");
        setOutput("");
      }
    }
  };

  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode and decode URLs and URI components"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === "encode"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === "decode"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          {mode === "encode" && (
            <button
              onClick={encodeFullURL}
              disabled={!input.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <LinkIcon size={18} />
              <span>Encode Full URL</span>
            </button>
          )}

          <button
            onClick={switchMode}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowRight size={18} />
            <span>Switch Mode</span>
          </button>

          <button
            onClick={loadSample}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FileText size={18} />
            <span>Load Sample</span>
          </button>

          <button
            onClick={clearAll}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span>Clear All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "encode" ? "Text/URL to Encode" : "URL Encoded String"}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text or URL to encode..."
                  : "Enter URL encoded string to decode..."
              }
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm resize-none"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "encode" ? "URL Encoded" : "Decoded Text/URL"}
              </h3>
              
              {output && !error && (
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
                    onClick={downloadOutput}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    title="Download output"
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
                placeholder={
                  error || 
                  (mode === "encode" 
                    ? "URL encoded text will appear here..." 
                    : "Decoded text will appear here..."
                  )
                }
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
            <div className="flex items-center space-x-3">
              <FileText className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <LinkIcon className="text-teal-600 dark:text-teal-400 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-1">URL Encoding Information</h4>
              <div className="text-sm text-teal-800 dark:text-teal-200 space-y-3">
                <div>
                  <p className="font-medium mb-1">Common Encodings:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Space → %20</li>
                    <li>• ! → %21</li>
                    <li>• @ → %40</li>
                    <li>• # → %23</li>
                    <li>• $ → %24</li>
                    <li>• % → %25</li>
                    <li>• & → %26</li>
                    <li>• = → %3D</li>
                    <li>• ? → %3F</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Use Cases:</p>
                  <ul className="space-y-1">
                    <li>• Encoding query parameters in URLs</li>
                    <li>• Preparing data for HTTP form submission</li>
                    <li>• Ensuring special characters don&apos;t break URL structure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}