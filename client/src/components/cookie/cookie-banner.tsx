"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCookieConsent } from "@/lib/context/cookie-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CookieBannerProps {
  showAsModal?: boolean;
  onClose?: () => void;
}

export default function CookieBanner({ showAsModal = false, onClose }: CookieBannerProps) {
  const {
    cookieSettings,
    showCookieBanner,
    consent,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    preferences: false,
    statistics: false,
    marketing: false,
  });

  // Initialize preferences from current consent state
  useEffect(() => {
    if (consent) {
      setPreferences({
        necessary: true, // Always true
        preferences: !!consent.preferences,
        statistics: !!consent.statistics,
        marketing: !!consent.marketing,
      });
    }
  }, [consent]);

  // If consent already given and not showing as modal, don't show banner
  if (consent && !showAsModal && !showCookieBanner) return null;

  // Create a default settings if not available
  const settings = cookieSettings || {
    consent_expiry_days: 180,
    block_until_consent: false,
    categories: []
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose?.();
  };

  const handleAcceptSelected = () => {
    savePreferences({
      ...preferences,
      necessary: true, // Always include necessary
      accept_all: false,
      reject_all: false
    });
    onClose?.();
  };

  const handleRejectAll = () => {
    rejectNonEssential();
    onClose?.();
  };

  if (!showCookieBanner) return null;

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg ${
        showAsModal ? "" : "fixed bottom-0 left-0 right-0 z-50"
      }`}
      initial={{ y: showAsModal ? 0 : 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: showAsModal ? 0 : 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Cookie Preferences</h2>
          {showAsModal && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">
          We use cookies to enhance your browsing experience, personalize content and ads, analyze our traffic, and provide social media features. You can choose to accept all cookies or customize your preferences.
        </p>

        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="cookie-settings">
            <AccordionTrigger className="text-sm font-medium">
              Customize Cookie Preferences
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {settings.categories && settings.categories.length > 0 ? (
                  settings.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <Switch 
                        checked={category.name.toLowerCase() === 'necessary' ? true : preferences[category.name.toLowerCase() as keyof typeof preferences]} 
                        disabled={category.name.toLowerCase() === 'necessary'}
                        onCheckedChange={(checked) => {
                          if (category.name.toLowerCase() === 'necessary') return;
                          setPreferences({
                            ...preferences,
                            [category.name.toLowerCase()]: checked
                          });
                        }}
                        aria-label={`Toggle ${category.name} cookies`}
                      />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Necessary</p>
                        <p className="text-sm text-gray-500">These cookies are essential for the website to function properly.</p>
                      </div>
                      <Switch checked={true} disabled={true} aria-label="Toggle Necessary cookies" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Preferences</p>
                        <p className="text-sm text-gray-500">These cookies allow the website to remember choices you make.</p>
                      </div>
                      <Switch 
                        checked={preferences.preferences} 
                        onCheckedChange={(checked) => {
                          setPreferences({
                            ...preferences,
                            preferences: checked
                          });
                        }}
                        aria-label="Toggle Preferences cookies"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Statistics</p>
                        <p className="text-sm text-gray-500">These cookies help us understand how visitors interact with the website.</p>
                      </div>
                      <Switch 
                        checked={preferences.statistics} 
                        onCheckedChange={(checked) => {
                          setPreferences({
                            ...preferences,
                            statistics: checked
                          });
                        }}
                        aria-label="Toggle Statistics cookies"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-sm text-gray-500">These cookies are used to track visitors across websites to display relevant advertisements.</p>
                      </div>
                      <Switch 
                        checked={preferences.marketing} 
                        onCheckedChange={(checked) => {
                          setPreferences({
                            ...preferences,
                            marketing: checked
                          });
                        }}
                        aria-label="Toggle Marketing cookies"
                      />
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handleRejectAll}
          >
            Reject non-essential
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAcceptSelected}
          >
            Accept selected
          </Button>
          <Button 
            onClick={handleAcceptAll}
          >
            Accept all
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <Link href="/privacy-policy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          {" • "}
          <Link href="/cookie-policy" className="underline hover:text-primary">
            Cookie Policy
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
