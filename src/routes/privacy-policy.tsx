import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div 
        className="max-w-4xl mx-auto py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link 
          to="/"
          className="inline-block mb-8 text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="mb-4">
              At Interactive Shopping, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Personal information you voluntarily provide</li>
              <li>Automatically collected information about your device</li>
              <li>Usage data and preferences</li>
              <li>Chat interactions with our AI assistant</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To personalize your shopping experience</li>
              <li>To improve our AI recommendations</li>
              <li>To communicate with you about deals and updates</li>
              <li>To prevent fraud and maintain security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Disclosure</h2>
            <p className="mb-4">
              We work with various e-commerce platforms and may share anonymized data to improve our services. 
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a 
                href="mailto:privacy@stores.deals" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@stores.deals
              </a>
            </p>
          </section>

          <section className="pt-8 text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 