"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface StatProps {
    value: string;
    label: string;
    delay: number;
}

function StatItem({ value, label, delay }: StatProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className="text-4xl md:text-5xl font-bold text-primary">{value}</div>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{label}</div>
        </motion.div>
    );
}

export default function StatsSection() {
    return (
        <section className="py-16 md:py-24 border-y border-neutral-200 dark:border-neutral-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Trusted by Developers Worldwide
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                        Join our growing community of developers building with Kaapi
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    <StatItem value="5M+" label="API Requests Daily" delay={0.1} />
                    <StatItem value="10k+" label="Active Developers" delay={0.2} />
                    <StatItem value="500+" label="Enterprise Clients" delay={0.3} />
                    <StatItem value="99.9%" label="Uptime Guarantee" delay={0.4} />
                </div>
            </div>
        </section>
    );
}
