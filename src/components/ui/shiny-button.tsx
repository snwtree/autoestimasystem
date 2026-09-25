"use client";

import type React from "react";
import Link from "next/link";

interface ShinyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  href?: string;
  disabled?: boolean;
}

export function ShinyButton({ children, onClick, className = "", type = "button", href, disabled = false }: ShinyButtonProps) {
  return (
    <>
      <style jsx global>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }

        @property --gradient-shine {
          syntax: "<color>";
          initial-value: #fff8df;
          inherits: false;
        }

        .shiny-cta {
          --shiny-cta-bg: #15120b;
          --shiny-cta-bg-subtle: #3a2b0e;
          --shiny-cta-fg: #fff8df;
          --shiny-cta-highlight: #d4af37;
          --shiny-cta-highlight-subtle: #ffe9a3;
          --duration: 7s;
          --shadow-size: 2px;
          --transition: 1200ms cubic-bezier(0.22, 1, 0.36, 1);

          isolation: isolate;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          padding: 0.85rem 1.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.2;
          font-weight: 600;
          border: 1px solid transparent;
          border-radius: 999px;
          color: var(--shiny-cta-fg);
          background:
            linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle), 0 12px 30px rgba(212, 175, 55, 0.16);
          transition: var(--transition);
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, transform, box-shadow;
          animation: gradient-angle var(--duration) linear infinite;
        }

        .shiny-cta:disabled,
        .shiny-cta[aria-disabled="true"] {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .shiny-cta.liquid-glass {
          --shiny-cta-bg: rgba(255, 255, 255, 0.1);
          --shiny-cta-bg-subtle: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(18px) saturate(130%);
          -webkit-backdrop-filter: blur(18px) saturate(130%);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -1px 1px rgba(0, 0, 0, 0.26),
            0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          display: none;
        }

        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle at var(--position) var(--position), #fff8df calc(var(--position) / 4), transparent 0) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(from calc(var(--gradient-angle) + 45deg), black, transparent 10% 90%, black);
          border-radius: inherit;
          opacity: 0.28;
        }

        .shiny-cta::after {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(-50deg, transparent, var(--shiny-cta-highlight), transparent);
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.45;
          animation: shimmer var(--duration) linear infinite;
        }

        .shiny-cta span {
          position: relative;
          z-index: 1;
        }

        .shiny-cta span::before {
          --size: calc(100% + 1rem);
          width: var(--size);
          height: var(--size);
          box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight);
          opacity: 0;
          transition: opacity var(--transition);
          animation: breathe calc(var(--duration) * 1.5) linear infinite;
        }

        .shiny-cta:hover,
        .shiny-cta:focus-visible {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
          transform: translateY(-1px);
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle), 0 16px 34px rgba(212, 175, 55, 0.28);
        }

        .shiny-cta.liquid-glass:hover,
        .shiny-cta.liquid-glass:focus-visible {
          color: #fff8df;
          background:
            linear-gradient(rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.14)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
        }

        .shiny-cta:hover span::before,
        .shiny-cta:focus-visible span::before {
          opacity: 1;
        }

        .shiny-cta:active {
          transform: translateY(1px);
        }

        @keyframes gradient-angle {
          to {
            --gradient-angle: 360deg;
          }
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }

        @keyframes breathe {
          from, to {
            scale: 1;
          }
          50% {
            scale: 1.2;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shiny-cta,
          .shiny-cta::after,
          .shiny-cta span::before {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      {href ? (
        <Link className={`shiny-cta ${className}`} href={href} onClick={onClick} aria-disabled={disabled}>
          <span>{children}</span>
        </Link>
      ) : (
        <button className={`shiny-cta ${className}`} onClick={onClick} type={type} disabled={disabled}>
          <span>{children}</span>
        </button>
      )}
    </>
  );
}