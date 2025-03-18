"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { useCookieConsent } from '../../lib/context/cookie-context';
import { CookieConsentSubmission } from '../../lib/types/cookies';

interface CookieBannerProps {
  showAsModal?: boolean;
  onClose?: () => void;
}

export default function CookieBanner({ showAsModal, onClose }: CookieBannerProps = {}) {
  const { 
    showCookieBanner, 
    consent,
    acceptAll,
    rejectNonEssential,
    savePreferences
  } = useCookieConsent();

  const [preferences, setPreferences] = useState<CookieConsentSubmission>({
    necessary: true, // Always required
    preferences: consent?.preferences || false,
    statistics: consent?.statistics || false,
    marketing: consent?.marketing || false,
    accept_all: false,
    reject_all: false
  });

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handleOpenModal = () => {
    setShowPreferencesModal(true);
  };

  const handleCloseModal = () => {
    setShowPreferencesModal(false);
  };

  const handlePreferenceChange = (category: keyof CookieConsentSubmission) => {
    if (category === 'necessary') return; // Cannot change necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSavePreferences = async () => {
    await savePreferences(preferences);
    handleCloseModal();
    if (onClose) onClose();
  };

  // Handle the accept all action
  const handleAcceptAll = async () => {
    await acceptAll();
    if (onClose) onClose();
  };

  // Handle the reject non-essential action
  const handleRejectNonEssential = async () => {
    await rejectNonEssential();
    if (onClose) onClose();
  };

  // Don't render anything if the banner shouldn't be shown and it's not forced via showAsModal
  if (!showCookieBanner && !showAsModal) {
    return null;
  }

  // If showing as a modal/dialog, render only the preferences UI
  if (showAsModal) {
    return (
      <div className="bg-white border rounded-lg shadow-lg w-full">
        <div className="flex flex-col gap-4 p-4">
          <div>
            <h3 className="text-lg font-semibold">Cookie preferences</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select which cookies you want to accept. Necessary cookies cannot be disabled.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Necessary cookies - always enabled */}
            <div className="flex items-center space-x-2">
              <Checkbox id="necessary-modal" checked={true} disabled />
              <label
                htmlFor="necessary-modal"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Necessary (required)
              </label>
            </div>
            
            {/* Preferences cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="preferences-modal" 
                checked={preferences.preferences}
                onCheckedChange={() => handlePreferenceChange('preferences')}
              />
              <label
                htmlFor="preferences-modal"
                className="text-sm font-medium leading-none"
              >
                Preferences
              </label>
            </div>
            
            {/* Statistics cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="statistics-modal" 
                checked={preferences.statistics}
                onCheckedChange={() => handlePreferenceChange('statistics')}
              />
              <label
                htmlFor="statistics-modal"
                className="text-sm font-medium leading-none"
              >
                Statistics
              </label>
            </div>
            
            {/* Marketing cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing-modal" 
                checked={preferences.marketing}
                onCheckedChange={() => handlePreferenceChange('marketing')}
              />
              <label
                htmlFor="marketing-modal"
                className="text-sm font-medium leading-none"
              >
                Marketing
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>
              Save preferences
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 z-50 w-full md:w-96 bg-white border rounded-t-lg shadow-lg p-4 m-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold">Cookie preferences</h3>
            <p className="text-sm text-gray-600 mt-1">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full border-neutral-200"
              onClick={handleAcceptAll}
            >
              Accept all cookies
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-neutral-200"
              onClick={handleRejectNonEssential}
            >
              Accept necessary only
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-neutral-200"
              onClick={handleOpenModal}
            >
              Customize preferences
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription>
              Select which cookies you want to accept. Necessary cookies cannot be disabled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            {/* Necessary cookies - always enabled */}
            <div className="flex items-center space-x-2">
              <Checkbox id="necessary" checked={true} disabled />
              <label
                htmlFor="necessary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Necessary (required)
              </label>
            </div>
            
            {/* Preferences cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="preferences" 
                checked={preferences.preferences}
                onCheckedChange={() => handlePreferenceChange('preferences')}
              />
              <label
                htmlFor="preferences"
                className="text-sm font-medium leading-none"
              >
                Preferences
              </label>
            </div>
            
            {/* Statistics cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="statistics" 
                checked={preferences.statistics}
                onCheckedChange={() => handlePreferenceChange('statistics')}
              />
              <label
                htmlFor="statistics"
                className="text-sm font-medium leading-none"
              >
                Statistics
              </label>
            </div>
            
            {/* Marketing cookies */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing" 
                checked={preferences.marketing}
                onCheckedChange={() => handlePreferenceChange('marketing')}
              />
              <label
                htmlFor="marketing"
                className="text-sm font-medium leading-none"
              >
                Marketing
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>
              Save preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}