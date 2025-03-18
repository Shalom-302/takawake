"use client"

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    quote: "Kaapi has transformed how we develop and deploy APIs. The intuitive interface and powerful automation have cut our development time in half.",
    author: "Sarah Johnson",
    title: "CTO at TechForward",
    avatar: "/placeholder.svg"
  },
  {
    quote: "The monitoring tools in Kaapi have helped us identify and fix issues before they impact our users. It's been a game-changer for our reliability.",
    author: "Michael Chen",
    title: "Lead Developer at DataFlow",
    avatar: "/placeholder.svg"
  },
  {
    quote: "We've been able to scale our API infrastructure effortlessly with Kaapi. The automated documentation has made onboarding new developers a breeze.",
    author: "Priya Patel",
    title: "Engineering Manager at ScaleUp",
    avatar: "/placeholder.svg"
  },
  {
    quote: "The security features built into Kaapi give us peace of mind. We know our APIs are protected by industry best practices without extra configuration.",
    author: "Thomas Rodriguez",
    title: "Security Specialist at SecureAPI",
    avatar: "/placeholder.svg"
  }
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through testimonials
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset interval when manually changing testimonial
  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            Hear from developers and companies who have transformed their API development with Kaapi
          </p>
        </motion.div>

        <div className="mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-80">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 flex flex-col"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 0.9,
                    zIndex: activeIndex === index ? 10 : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex-grow">
                    <svg className="h-10 w-10 text-primary mb-4" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-lg italic text-neutral-700 dark:text-neutral-300">{testimonial.quote}</p>
                  </div>
                  <div className="flex items-center mt-6">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{testimonial.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeIndex === index 
                      ? 'bg-primary' 
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
