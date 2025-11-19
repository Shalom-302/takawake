import MainLayout from "@/components/layouts/main-layout";

export default function PrivacyPolicyPage() {
    return (
        <MainLayout>
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="lead text-xl text-gray-600 mb-8">
                        Your privacy is important to us. This Privacy Policy explains how we
                        collect, use, disclose, and safeguard your information when you visit our
                        website.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information
                        we may collect via the website includes:
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Personal Data</h3>
                    <p>
                        Personally identifiable information, such as your name, email address, and
                        telephone number, that you voluntarily give to us when you register with the
                        website or when you choose to participate in various activities related to
                        the website. You are under no obligation to provide us with personal
                        information of any kind, however your refusal to do so may prevent you from
                        using certain features of the website.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Derivative Data</h3>
                    <p>
                        Information our servers automatically collect when you access the website,
                        such as your IP address, your browser type, your operating system, your
                        access times, and the pages you have viewed directly before and after
                        accessing the website.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Your Information</h2>
                    <p>
                        Having accurate information about you permits us to provide you with a
                        smooth, efficient, and customized experience. Specifically, we may use
                        information collected about you via the website to:
                    </p>
                    <ul className="list-disc ml-6 my-4">
                        <li>Create and manage your account.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>
                            Fulfill and manage purchases, orders, payments, and other transactions
                            related to the website.
                        </li>
                        <li>
                            Generate a personal profile about you to make future visits to the
                            website more personalized.
                        </li>
                        <li>Increase the efficiency and operation of the website.</li>
                        <li>
                            Monitor and analyze usage and trends to improve your experience with the
                            website.
                        </li>
                        <li>Notify you of updates to the website.</li>
                        <li>Offer new products, services, and/or recommendations to you.</li>
                        <li>Perform other business activities as needed.</li>
                        <li>
                            Prevent fraudulent transactions, monitor against theft, and protect
                            against criminal activity.
                        </li>
                        <li>Process payments and refunds.</li>
                        <li>Request feedback and contact you about your use of the website.</li>
                        <li>Resolve disputes and troubleshoot problems.</li>
                        <li>Respond to product and customer service requests.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">
                        Disclosure of Your Information
                    </h2>
                    <p>
                        We may share information we have collected about you in certain situations.
                        Your information may be disclosed as follows:
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">By Law or to Protect Rights</h3>
                    <p>
                        If we believe the release of information about you is necessary to respond
                        to legal process, to investigate or remedy potential violations of our
                        policies, or to protect the rights, property, and safety of others, we may
                        share your information as permitted or required by any applicable law, rule,
                        or regulation.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">
                        Security of Your Information
                    </h2>
                    <p>
                        We use administrative, technical, and physical security measures to help
                        protect your personal information. While we have taken reasonable steps to
                        secure the personal information you provide to us, please be aware that
                        despite our efforts, no security measures are perfect or impenetrable, and
                        no method of data transmission can be guaranteed against any interception or
                        other type of misuse.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
                    <p>
                        Depending on your location, you may have certain rights regarding your
                        personal information, including:
                    </p>
                    <ul className="list-disc ml-6 my-4">
                        <li>Right to access personal information we hold about you</li>
                        <li>Right to request correction of inaccurate data</li>
                        <li>Right to request deletion of your data</li>
                        <li>Right to object to our processing of your data</li>
                        <li>Right to restrict our processing of your data</li>
                        <li>Right to data portability</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact
                        us at:
                    </p>
                    <p className="mt-2">
                        <strong>Email:</strong> privacy@example.com
                        <br />
                        <strong>Address:</strong> 123 Privacy Street, Data City, 10101
                        <br />
                        <strong>Phone:</strong> +1 (555) 123-4567
                    </p>

                    <p className="mt-8">
                        This policy was last updated on: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
