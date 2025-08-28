"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { useCookieConsent } from "../../lib/contexts/cookie-context";
import { CookieConsentSubmission } from "../../lib/types/cookies";
import { Button } from "../ui/buttons/button";

interface CookieBannerProps {
    showAsModal?: boolean;
    onClose?: () => void;
}

export default function CookieBanner({ showAsModal, onClose }: CookieBannerProps = {}) {
    const { showCookieBanner, consent, acceptAll, rejectNonEssential, savePreferences } =
        useCookieConsent();

    const [preferences, setPreferences] = useState<CookieConsentSubmission>({
        necessary: true, // Always required
        preferences: consent?.preferences || false,
        statistics: consent?.statistics || false,
        marketing: consent?.marketing || false,
        accept_all: false,
        reject_all: false,
    });

    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

    const handleOpenModal = () => {
        setShowPreferencesModal(true);
    };

    const handleCloseModal = () => {
        setShowPreferencesModal(false);
    };

    const handlePreferenceChange = (category: keyof CookieConsentSubmission) => {
        if (category === "necessary") return; // Cannot change necessary cookies

        setPreferences(prev => ({
            ...prev,
            [category]: !prev[category],
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
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-5">
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium mb-2">Here are our cookies 🍪</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            On this site, we use cookies to measure our audience, to maintain your
                            session with us and to occasionally send you content that might interest
                            you.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="space-y-5">
                        {/* Necessary cookies - always enabled */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium">Essential Cookies</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    These cookies are necessary for the proper functioning of the
                                    site.
                                </p>
                            </div>
                            <Switch
                                checked={true}
                                disabled
                                className="data-[state=checked]:bg-gray-400"
                            />
                        </div>

                        {/* Preferences cookies */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium">Personalization Cookies</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    They adapt the site to your tastes so that it resembles you.
                                </p>
                            </div>
                            <Switch
                                checked={preferences.preferences}
                                onCheckedChange={() => handlePreferenceChange("preferences")}
                                className="data-[state=checked]:bg-gray-400"
                            />
                        </div>

                        {/* Statistics cookies */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium">
                                    Analytics and Statistics Cookies
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    They help us make the site even more relevant for you.
                                </p>
                            </div>
                            <Switch
                                checked={preferences.statistics}
                                onCheckedChange={() => handlePreferenceChange("statistics")}
                                className="data-[state=checked]:bg-gray-400"
                            />
                        </div>

                        {/* Marketing cookies */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium">Performance Cookies</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    They allow us to analyze your experience by comparing your
                                    preferences.
                                </p>
                            </div>
                            <Switch
                                checked={preferences.marketing}
                                onCheckedChange={() => handlePreferenceChange("marketing")}
                                className="data-[state=checked]:bg-gray-400"
                            />
                        </div>
                    </div>

                    {/* Divider + Buttons */}
                    <div className="flex items-center justify-between pt-6 mt-6 border-t">
                        <Button onClick={handleCloseModal} variant="outline">
                            Back
                        </Button>
                        <Button onClick={handleSavePreferences}>Done</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Banner - small floating cookie notice at bottom */}
            <div className="fixed bottom-10 left-4 z-50 max-w-xs bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-start">
                    <div>
                        <div className="flex">
                            <div className="p-2 rounded-full bg-neutral-50 w-auto">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                                    <path d="M8.5 8.5a10 10 0 0 0 11 11" />
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-base font-medium mb-1">
                            We use cookies to improve your experience 🍪
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            For easier site navigation, the website can store your usage data and
                            send you occasional relevant content.
                        </p>

                        <div className="flex flex-col flex-wrap gap-2">
                            <Button
                                onClick={handleRejectNonEssential}
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                No thanks
                            </Button>

                            <Button
                                onClick={handleOpenModal}
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                I choose
                            </Button>

                            <Button
                                onClick={handleAcceptAll}
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                Accept all
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences Modal - Centered with X */}
            <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
                <DialogContent className="max-w-md p-0 bg-white rounded-lg shadow-lg overflow-hidden border-none">
                    <div className="p-5">
                        <DialogTitle className="text-lg font-medium">
                            Here are our cookies 🍪
                        </DialogTitle>
                        <p className="text-sm text-gray-600 mb-6">
                            On this site, we use cookies to measure our audience, to maintain your
                            session with us and to occasionally send you content that might interest
                            you.
                        </p>

                        <div className="space-y-5">
                            {/* Necessary cookies - always enabled */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-medium">Essential Cookies</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        These cookies are necessary for the proper functioning of
                                        the site.
                                    </p>
                                </div>
                                <Switch
                                    checked={true}
                                    disabled
                                    className="data-[state=checked]:bg-gray-400"
                                />
                            </div>

                            {/* Preferences cookies */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-medium">
                                        Personalization Cookies
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        They adapt the site to your tastes so that it resembles you.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.preferences}
                                    onCheckedChange={() => handlePreferenceChange("preferences")}
                                    className="data-[state=checked]:bg-gray-400"
                                />
                            </div>

                            {/* Statistics cookies */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-medium">
                                        Analytics and Statistics Cookies
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        They help us make the site even more relevant for you.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.statistics}
                                    onCheckedChange={() => handlePreferenceChange("statistics")}
                                    className="data-[state=checked]:bg-gray-400"
                                />
                            </div>

                            {/* Marketing cookies */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-medium">Performance Cookies</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        They allow us to analyze your experience by comparing your
                                        preferences.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.marketing}
                                    onCheckedChange={() => handlePreferenceChange("marketing")}
                                    className="data-[state=checked]:bg-gray-400"
                                />
                            </div>
                        </div>

                        {/* Divider + Buttons */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t">
                            <Button onClick={handleCloseModal} variant="outline">
                                Back
                            </Button>
                            <Button onClick={handleSavePreferences}>Done</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
