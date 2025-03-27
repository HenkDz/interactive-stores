import React from 'react';
import { motion } from 'framer-motion';

function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div 
        className="max-w-4xl mx-auto py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Affiliate Disclosure
        </h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment to Transparency</h2>
            <p className="mb-4">
              Interactive Shopping believes in complete transparency with our users. This disclosure explains how we 
              make money and maintain our service while providing you with valuable shopping recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Affiliate Partnerships</h2>
            <p className="mb-4">
              We participate in affiliate programs with various e-commerce platforms, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Amazon Associates Program</li>
              <li>AliExpress Affiliate Program</li>
              <li>Temu Affiliate Program</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
            <p className="mb-4">
              When you click on certain links or make purchases through our platform, we may earn a commission. 
              This comes at no additional cost to you - the prices you see are the same as visiting the stores directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Promise</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We only recommend products we believe provide real value</li>
              <li>Our AI recommendations are based on product quality and user reviews</li>
              <li>Commission rates never influence our product recommendations</li>
              <li>We clearly mark all affiliate links</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Additional Information</h2>
            <p className="mb-4">
              While we strive to keep our information accurate and up-to-date, prices and availability may vary. 
              We recommend always reviewing the final price and terms on the retailer's website before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              If you have questions about our affiliate relationships, please contact us at{' '}
              <a 
                href="mailto:affiliates@stores.deals" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                affiliates@stores.deals
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

export default AffiliateDisclosure; 