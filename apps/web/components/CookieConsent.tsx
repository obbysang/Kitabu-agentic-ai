import React, { useState } from 'react';
import { Shield, X, Check, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { CookieCategory, ConsentPreferences } from '../types/cookie-consent';

const CookieConsent: React.FC = () => {
  const { 
    isOpen, 
    consent, 
    acceptAll, 
    acceptEssentialsOnly, 
    savePreferences, 
    openConsentManager 
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<Partial<ConsentPreferences>>({
    functional: consent?.functional || false,
    analytics: consent?.analytics || false,
    marketing: consent?.marketing || false,
  });

  // If not open and we have consent, don't render anything
  // (Unless we want a floating button to reopen, which we might add later or let the user add manually)
  if (!isOpen) return null;

  const handleToggle = (category: keyof ConsentPreferences) => {
    setPreferences(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowDetails(false);
  };

  if (showDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <Shield className="w-5 h-5 text-blue-600" />
              Cookie Preferences
            </h2>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <p className="text-slate-600 dark:text-slate-300">
              Manage your cookie preferences here. Essential cookies are always required for the website to function properly.
            </p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Essential Cookies</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Necessary for the website to function (security, session management).
                  </p>
                </div>
                <div className="flex items-center h-6">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="ml-2 text-sm text-slate-400 font-medium">Always Active</span>
                </div>
              </div>

              {/* Functional */}
              <div className="flex items-start justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Functional Cookies</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enable enhanced functionality and personalization.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferences.functional}
                    onChange={() => handleToggle('functional')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Analytics Cookies</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Help us understand how visitors interact with the website.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferences.analytics}
                    onChange={() => handleToggle('analytics')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Marketing Cookies</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Used to deliver relevant advertisements and track performance.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferences.marketing}
                    onChange={() => handleToggle('marketing')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <button 
              onClick={acceptAll}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Accept All
            </button>
            <button 
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
            <Shield className="w-5 h-5 text-blue-600" />
            We value your privacy
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">Read our Privacy Policy</a>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center whitespace-nowrap">
          <button 
            onClick={() => setShowDetails(true)}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            Customize
          </button>
          <button 
            onClick={acceptEssentialsOnly}
            className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            Reject Non-Essential
          </button>
          <button 
            onClick={acceptAll}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
