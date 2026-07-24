"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

function moveSpotlight(event: MouseEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
}

export function SpotlightLink({
  href,
  className = "",
  target,
  children,
}: {
  href: string;
  className?: string;
  target?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
      className={`spotlight ${className}`}
      onMouseMove={moveSpotlight}
    >
      {children}
    </a>
  );
}

export function SpotlightButton({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`spotlight ${className}`}
      onMouseMove={moveSpotlight}
    >
      {children}
    </button>
  );
}
