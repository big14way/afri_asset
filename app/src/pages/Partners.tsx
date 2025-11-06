import { useState } from 'react';
import { PartnerApplicationForm } from '../components/PartnerApplicationForm';

export const Partners = () => {
  const [showApplication, setShowApplication] = useState(false);

  const benefits = [
    {
      icon: '🌍',
      title: 'Global Investor Access',
      description: 'Reach thousands of investors worldwide looking for African asset opportunities',
    },
    {
      icon: '⚡',
      title: 'Instant Liquidity',
      description: 'Tokenize assets and unlock capital in days, not months',
    },
    {
      icon: '🔒',
      title: 'Secure & Transparent',
      description: 'Blockchain-based ownership records and automated smart contract execution',
    },
    {
      icon: '💰',
      title: 'Lower Costs',
      description: 'Reduce intermediary fees with direct-to-investor tokenization',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track asset performance, investor interest, and trading activity in real-time',
    },
    {
      icon: '🤝',
      title: 'Partnership Support',
      description: 'Dedicated support team to help you through the tokenization process',
    },
  ];

  const criteria = [
    {
      title: 'Registered Legal Entity',
      description: 'Valid business registration in your country of operation',
      required: true,
    },
    {
      title: 'Asset Documentation',
      description: 'Proof of ownership, valuation reports, and legal titles',
      required: true,
    },
    {
      title: 'Insurance Coverage',
      description: 'Assets must be insured against major risks',
      required: true,
    },
    {
      title: 'Financial Transparency',
      description: 'Audited financial statements or tax returns',
      required: true,
    },
    {
      title: 'Track Record',
      description: 'Demonstrated experience in your industry (2+ years preferred)',
      required: false,
    },
    {
      title: 'KYC/AML Compliance',
      description: 'Willingness to complete identity verification',
      required: true,
    },
  ];

  const process = [
    {
      step: 1,
      title: 'Submit Application',
      description: 'Fill out the partner application form with your organization details',
      duration: '10 minutes',
    },
    {
      step: 2,
      title: 'Initial Review',
      description: 'Our team reviews your application and verifies documentation',
      duration: '3-5 business days',
    },
    {
      step: 3,
      title: 'Due Diligence',
      description: 'Complete KYC/AML checks and asset verification process',
      duration: '1-2 weeks',
    },
    {
      step: 4,
      title: 'Onboarding',
      description: 'Get access to partner dashboard and tokenization tools',
      duration: '1-2 days',
    },
    {
      step: 5,
      title: 'Launch',
      description: 'Tokenize your first asset and start accepting investments',
      duration: 'Same day',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🤝 Become an Asset Provider Partner
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Join our network of verified asset providers and unlock global capital for your African real-world assets
        </p>
        <button
          onClick={() => setShowApplication(true)}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Apply to Become a Partner
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          No upfront fees • Fast approval • Global reach
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 my-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">$18.9T</div>
            <div className="text-primary-100">Projected RWA Market by 2033</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">10+</div>
            <div className="text-primary-100">Asset Provider Partners</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">$1M+</div>
            <div className="text-primary-100">Assets Under Management</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-primary-100">Global Trading Access</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Why Partner with AfriAssets?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Criteria */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Partnership Requirements
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {criteria.map((item, index) => (
              <div key={index} className="p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {item.required ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.required
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.required ? 'Required' : 'Preferred'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Onboarding Process
        </h2>
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-300 dark:bg-gray-700" style={{ top: '2rem', height: 'calc(100% - 4rem)' }} />

          {/* Process Steps */}
          <div className="space-y-8">
            {process.map((item, index) => (
              <div key={index} className="relative flex items-center">
                {/* Step Number */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full items-center justify-center text-xl font-bold z-10 shadow-lg">
                  {item.step}
                </div>

                {/* Content */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:ml-auto md:pl-8'}`}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex md:hidden w-10 h-10 bg-primary-600 text-white rounded-full items-center justify-center text-lg font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                    <div className="inline-flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl my-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Tokenize Your Assets?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join leading African asset providers who are already unlocking global capital through tokenization
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowApplication(true)}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Apply Now
          </button>
          <a
            href="mailto:partners@afriassets.com"
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-lg font-medium border border-gray-300 dark:border-gray-600 transition-all"
          >
            Contact Sales
          </a>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Questions? Email us at <a href="mailto:partners@afriassets.com" className="text-primary-600 dark:text-primary-400 hover:underline">partners@afriassets.com</a>
        </p>
      </div>

      {/* Application Modal */}
      {showApplication && (
        <PartnerApplicationForm onClose={() => setShowApplication(false)} />
      )}
    </div>
  );
};
