import Link from "next/link";
import { 
  Link as LinkIcon, 
  QrCode, 
  FileText, 
  Lock, 
  Code2,
  Hash
} from "lucide-react";

export default function Home() {
  const tools = [
    {
      name: "URL Shortener",
      description: "Create short, shareable links with custom codes and analytics",
      icon: LinkIcon,
      href: "/url-shortener",
      color: "bg-blue-500",
    },
    {
      name: "QR Code Generator",
      description: "Generate QR codes for URLs with customizable styling",
      icon: QrCode,
      href: "/qr-generator",
      color: "bg-green-500",
    },
    {
      name: "JSON Formatter",
      description: "Format, validate and minify JSON data",
      icon: Code2,
      href: "/json-formatter",
      color: "bg-purple-500",
    },
    {
      name: "Base64 Encoder",
      description: "Encode and decode Base64 strings",
      icon: Hash,
      href: "/base64",
      color: "bg-orange-500",
    },
    {
      name: "URL Encoder",
      description: "Encode and decode URL strings",
      icon: FileText,
      href: "/url-encoder",
      color: "bg-teal-500",
    },
    {
      name: "File Sharing",
      description: "Share files temporarily with automatic expiration",
      icon: Lock,
      href: "/file-sharing",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Developer Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Clean, reliable, and ad-free online tools for developers. 
            Simple to use, built for productivity.
          </p>
        </header>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${tool.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with ❤️ for developers. No ads, no tracking, just tools.
          </p>
        </footer>
      </div>
    </div>
  );
}
