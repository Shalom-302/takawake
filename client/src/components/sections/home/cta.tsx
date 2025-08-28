"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/buttons/button";

export default function CTASection() {
    return (
        <section className="py-16 md:py-24 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Ready to Transform Your API Development?
                    </h2>
                    <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
                        Join thousands of developers who are building faster, more secure, and
                        scalable APIs with Kaapi's modern platform.
                    </p>

                    <motion.div
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <Link href="/auth/register">
                            <Button size="lg" variant="secondary" className="font-medium">
                                Start for Free
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent text-white border-white hover:bg-white/10"
                            >
                                Read Documentation
                            </Button>
                        </Link>
                    </motion.div>

                    <p className="mt-6 text-sm text-white/70">
                        No credit card required. Get started with our generous free tier.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
