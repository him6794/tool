"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Copy, Download, ArrowRight, FileText } from "lucide-react";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const processText = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = btoa(input);
        setOutput(encoded);
        setError("");
      } else {
        const decoded = atob(input);
        setOutput(decoded);
        setError("");
      }
    } catch (err) {
      setError(mode === "decode" ? "Invalid Base64 input" : "Encoding failed");
      setOutput("");
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Auto-process on input change
    if (value.trim()) {
      try {
        if (mode === "encode") {
          const encoded = btoa(value);
          setOutput(encoded);
          setError("");
        } else {
          const decoded = atob(value);
          setOutput(decoded);
          setError("");
        }
      } catch (err) {
        setError(mode === "decode" ? "Invalid Base64 input" : "Encoding failed");
        setOutput("");
      }
    } else {
      setOutput("");
      setError("");
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
      link.download = mode === "encode" ? 'encoded.txt' : 'decoded.txt';
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
      setInput("Hello, World! This is a sample text to encode.");
    } else {
      setInput("SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgdG8gZW5jb2RlLg==");
    }
  };

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode and decode text using Base64 encoding"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === "encode"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === "decode"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={processText}
            disabled={!input.trim()}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Hash size={18} />
            <span>{mode === "encode" ? "Encode" : "Decode"}</span>
          </button>

          <button
            onClick={switchMode}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
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
                  ? "Enter text to encode..."
                  : "Enter Base64 string to decode..."
              }
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm resize-none"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "encode" ? "Base64 Encoded" : "Decoded Text"}
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
                    ? "Base64 encoded text will appear here..." 
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
              <Hash className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Hash className="text-orange-600 dark:text-orange-400 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">About Base64</h4>
              <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>• Base64 encoding converts binary data to ASCII text format</li>
                <li>• Commonly used for embedding images in HTML/CSS or email attachments</li>
                <li>• Uses 64 characters: A-Z, a-z, 0-9, +, /, and = for padding</li>
                <li>• Increases data size by approximately 33%</li>
                <li>• Safe for transmission over text-based protocols</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}