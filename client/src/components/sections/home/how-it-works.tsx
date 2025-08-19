"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
    {
        number: "01",
        title: "Design Your API",
        description:
            "Use our intuitive visual interface to design your API endpoints, define data models, and specify validation rules.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
            </svg>
        ),
    },
    {
        number: "02",
        title: "Develop & Test",
        description:
            "Write your API implementation, with automatic testing and documentation generated from your design.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
            </svg>
        ),
    },
    {
        number: "03",
        title: "Deploy & Scale",
        description:
            "Deploy your API with one click to our global infrastructure, with automatic scaling based on traffic.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
            </svg>
        ),
    },
    {
        number: "04",
        title: "Monitor & Optimize",
        description:
            "Track API performance, user behavior, and business metrics to continuously improve your services.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
    },
];

export default function HowItWorksSection() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">How Kaapi Works</h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                        A streamlined workflow that helps you build APIs faster and better
                    </p>
                </motion.div>

                <motion.div
                    className="relative"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {/* Connecting line */}
                    <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

                    <div className="space-y-12 md:space-y-0">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="md:grid md:grid-cols-2 md:gap-8 items-center"
                                variants={item}
                                transition={{ duration: 0.5 }}
                            >
                                <div
                                    className={`md:flex ${index % 2 === 0 ? "md:justify-end" : "md:order-2"}`}
                                >
                                    <div className="relative bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 max-w-md">
                                        <div className="absolute -top-5 -left-5 bg-primary/10 rounded-full p-3">
                                            {step.icon}
                                        </div>
                                        <div className="ml-4 mt-4">
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400 font-mono mb-2">
                                                {step.number}
                                            </div>
                                            <h3 className="text-xl font-semibold mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-neutral-600 dark:text-neutral-400">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`hidden md:flex ${index % 2 === 0 ? "md:order-2 md:justify-start" : "md:justify-end"}`}
                                >
                                    <div className="relative w-full max-w-xs h-64">
                                        <div className="absolute -top-2 -left-2 w-full h-full bg-primary/5 rounded-lg"></div>
                                        <div className="absolute inset-0 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                                            <Image
                                                src="/placeholder.svg"
                                                alt={`Step ${index + 1}: ${step.title}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
