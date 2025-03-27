"use client"

import React, { ReactNode } from 'react'

interface HeadingTitleProps {
  children: ReactNode
}

export function HeadingTitle({ children }: HeadingTitleProps) {
  return (
    <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
  )
}

interface HeadingDescriptionProps {
  children: ReactNode
}

export function HeadingDescription({ children }: HeadingDescriptionProps) {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>
  )
}

interface HeadingProps {
  children: ReactNode
  className?: string
}

export function Heading({ children, className = "" }: HeadingProps) {
  return (
    <div className={`mb-6 space-y-1 ${className}`}>
      {children}
    </div>
  )
}
