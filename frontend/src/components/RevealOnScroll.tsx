"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  retrasoMs?: number;
}

export default function RevealOnScroll({
  children,
  className,
  retrasoMs = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) {
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${retrasoMs}ms` }}
      className={clsx(
        "transition-all duration-1000 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
