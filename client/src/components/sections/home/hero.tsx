"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button/button";

export default function HeroSection() {
    return (
        <motion.section
            className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div
                        className="md:w-1/2 text-center md:text-left"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            Build powerful APIs <span className="text-primary">effortlessly</span>
                        </h1>
                        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                            Kaapi is an advanced platform for creating, testing, and deploying APIs.
                            Increase your development speed and streamline your workflow with our
                            intuitive tools and powerful features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start">
                            <Link href="/auth/register">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Get Started
                                </Button>
                            </Link>
                            <Link href="/docs">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                    Documentation
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
                            <p>No credit card required. Free plan available.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:w-1/2 relative"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <Image
                                src="/placeholder.svg"
                                alt="Kaapi Platform"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}
