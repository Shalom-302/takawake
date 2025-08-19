import MainLayout from "@/components/layouts/main-layout";

export default function CookiePolicyPage() {
    return (
        <MainLayout>
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>

                <div className="prose prose-lg max-w-none">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">What are cookies?</h2>
                    <p>
                        Cookies are small text files that are placed on your computer, smartphone or
                        other device when you access the internet. Cookies are widely used by
                        website owners in order to make their websites work, or to work more
                        efficiently, as well as to provide reporting information.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">How we use cookies</h2>
                    <p>
                        We use cookies for a number of different purposes. Some cookies are
                        necessary for technical reasons; some enable a personalized experience for
                        both visitors and registered users; and some allow the display of
                        advertising from selected third party networks. Some of these cookies may be
                        set when a page is loaded, or when a user takes a particular action on the
                        website. Many of the cookies we use are only set if you are a registered
                        user (so you don't need to register again when you visit later), while
                        others are set whenever you visit one of our websites, irrespective of
                        whether you have an account.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Types of cookie we use</h2>
                    <p>We use the following types of cookies:</p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Necessary</h3>
                    <p>
                        These cookies are essential for the website to function properly. They
                        enable basic functions like page navigation and access to secure areas of
                        the website. The website cannot function properly without these cookies.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Preferences</h3>
                    <p>
                        These cookies enable the website to remember information that changes the
                        way the website behaves or looks, like your preferred language or the region
                        that you are in.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Statistics</h3>
                    <p>
                        These cookies help us understand how visitors interact with the website by
                        collecting and reporting information anonymously. They help us improve the
                        site functionality and your experience.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Marketing</h3>
                    <p>
                        These cookies are used to track visitors across websites. The intention is
                        to display ads that are relevant and engaging for the individual user and
                        thereby more valuable for publishers and third party advertisers.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Controlling cookies</h2>
                    <p>
                        You can control and/or delete cookies as you wish – for details, see
                        aboutcookies.org. You can delete all cookies that are already on your
                        computer and you can set most browsers to prevent them from being placed. If
                        you do this, however, you may have to manually adjust some preferences every
                        time you visit a site and some services and functionalities may not work.
                    </p>

                    <p>
                        You can also adjust your cookie preferences at any time by clicking on the
                        cookie preferences button in the bottom right corner of the website.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">
                        Changes to this Cookie Policy
                    </h2>
                    <p>
                        We may update this Cookie Policy from time to time in order to reflect, for
                        example, changes to the cookies we use or for other operational, legal or
                        regulatory reasons. Please therefore re-visit this Cookie Policy regularly
                        to stay informed about our use of cookies.
                    </p>

                    <p className="mt-8">
                        This policy was last updated on: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
