"use client";

import type React from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagneticImpactCardProps {
  label: string;
  title: string;
  hoverLabel?: string;
  hoverTitle?: string;
  className?: string;
}

export function MagneticImpactCard({
  label,
  title,
  hoverLabel = "WORN FORWARD",
  hoverTitle = "HHARA IMPACT",
  className = "",
}: MagneticImpactCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const innerTextRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15);
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15);

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }

      if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate(${-currentPos.current.x}px, ${-currentPos.current.y}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePos.current = { x, y };
    currentPos.current = { x, y };
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const maxCircleSize = Math.max(containerSize.width, containerSize.height) * 2.5;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center p-8 rounded-none overflow-hidden select-none",
        "border min-h-[190px]",
        className
      )}
      style={{
        borderRadius: 0,
        backgroundColor: "transparent",
        borderColor: "rgba(58, 36, 22, 0.18)",
      }}
    >
      {/* Base Layer */}
      <div className="flex flex-col items-center justify-center text-center gap-2 transition-opacity duration-300">
        <span
          style={{
            fontFamily: "var(--sans)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontSize: "clamp(22px, 2.6vw, 30px)",
            fontWeight: 400,
            letterSpacing: "-0.005em",
            color: "var(--ink)",
            lineHeight: 1.25,
          }}
        >
          {title}
        </span>
      </div>

    </div>
  );
}
