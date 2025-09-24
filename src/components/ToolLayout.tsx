import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Tools</span>
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </header>

        {/* Tool Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}