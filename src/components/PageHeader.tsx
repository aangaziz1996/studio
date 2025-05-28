
"use client";

import { AppLogo } from "@/components/AppLogo";

type PageHeaderProps = {
  title: string;
  rightContent?: React.ReactNode; // Made this more generic
};

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <AppLogo />
        <h1 className="text-xl font-semibold">{title}</h1>
        {rightContent ? rightContent : <div className="w-10 h-10" /> /* Placeholder for spacing if no content */}
      </div>
    </header>
  );
}
