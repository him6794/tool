"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Link as LinkIcon, Copy, ExternalLink, Calendar, BarChart3 } from "lucide-react";
import { clsx } from "clsx";

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
}

export default function URLShortener() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!url.trim() || !isValidUrl(url)) {
      alert("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shortCode = customCode.trim() || generateShortCode();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tools.example.com';
    const shortUrl = `${baseUrl}/${shortCode}`;
    
    const expiresAt = expirationDays 
      ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000)
      : undefined;

    const newShortenedUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl: url,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date(),
      expiresAt,
    };

    setShortenedUrls(prev => [newShortenedUrl, ...prev]);
    setUrl("");
    setCustomCode("");
    setExpirationDays("");
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <ToolLayout
      title="URL Shortener"
      description="Create short, shareable links with optional custom codes and expiration dates"
    >
      <div className="space-y-8">
        {/* URL Shortening Form */}
        <div className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter URL to shorten
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom short code (optional)
              </label>
              <input
                type="text"
                id="customCode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-link"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiration (days, optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  id="expiration"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="365"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleShorten}
            disabled={!url.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <LinkIcon size={20} />
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </div>

        {/* Shortened URLs List */}
        {shortenedUrls.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 size={24} />
              <span>Your Shortened URLs</span>
            </h3>
            
            <div className="space-y-4">
              {shortenedUrls.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {item.shortUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(item.shortUrl, item.id)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                          {copiedId === item.id && (
                            <span className="text-green-600 text-sm">Copied!</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          → {item.originalUrl}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <BarChart3 size={16} />
                          <span>{item.clicks} clicks</span>
                        </span>
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                        >
                          <ExternalLink size={16} />
                          <span>Visit</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                      <span>Created: {item.createdAt.toLocaleDateString()}</span>
                      {item.expiresAt && (
                        <span className={clsx(
                          "font-medium",
                          item.expiresAt < new Date() ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                        )}>
                          {item.expiresAt < new Date() ? "Expired" : `Expires: ${item.expiresAt.toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}