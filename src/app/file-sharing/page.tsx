"use client";

import ToolLayout from "@/components/ToolLayout";
import { Lock, Upload, Clock, Shield } from "lucide-react";

export default function FileSharing() {
  return (
    <ToolLayout
      title="File Sharing"
      description="Share files temporarily with automatic expiration"
    >
      <div className="space-y-8">
        {/* Coming Soon Notice */}
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-red-600 dark:text-red-400" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Secure file sharing with automatic expiration is currently under development. 
            This feature will allow you to upload files and share them with temporary links.
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <Upload className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Easy Upload
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag and drop files or click to upload. Support for multiple file types.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <Clock className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Auto Expiration
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Files automatically expire after a set period. No permanent storage.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Secure Sharing
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Optional password protection and encryption for sensitive files.
            </p>
          </div>
        </div>

        {/* Planned Features */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center space-x-2">
            <Lock size={20} />
            <span>Planned Features</span>
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Upload files up to 100MB</li>
            <li>• Automatic expiration (1 hour to 7 days)</li>
            <li>• Password protection for sensitive files</li>
            <li>• Download tracking and analytics</li>
            <li>• File encryption for privacy</li>
            <li>• QR code generation for easy sharing</li>
            <li>• Email notifications</li>
            <li>• Bulk file upload support</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}