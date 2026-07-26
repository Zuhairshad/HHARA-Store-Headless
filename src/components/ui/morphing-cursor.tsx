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
  const animationFrameRef = useRef<number>();

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
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex flex-col items-center justify-center p-8 rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-500",
        "bg-[#3A2416] border border-[#B8892E]/25 shadow-lg min-h-[190px]",
        className
      )}
      style={{
        backgroundColor: isHovered ? "#F0EAE0" : "#3A2416",
        borderColor: isHovered ? "rgba(184, 137, 46, 0.45)" : "rgba(184, 137, 46, 0.22)",
      }}
    >
      {/* Base Layer (Dark state) */}
      <div className="flex flex-col items-center justify-center text-center gap-2 transition-opacity duration-300">
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#F2E6C8]/70" style={{ color: "rgba(242, 230, 200, 0.75)" }}>
          {label}
        </span>
        <span className="font-serif text-3xl md:text-4xl text-[#F2E6C8] tracking-tight" style={{ fontFamily: "var(--display)", color: "#F2E6C8" }}>
          {title}
        </span>
      </div>

      {/* Morphing Magnetic Lens Circle Reveal (Beige + Golden HHARA Text on Hover) */}
      <div
        ref={circleRef}
        className="absolute top-0 left-0 pointer-events-none rounded-full bg-[#F0EAE0] overflow-hidden"
        style={{
          width: isHovered ? maxCircleSize : 0,
          height: isHovered ? maxCircleSize : 0,
          transition: "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
          willChange: "transform, width, height",
        }}
      >
        <div
          ref={innerTextRef}
          className="absolute flex flex-col items-center justify-center text-center gap-2"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            top: "50%",
            left: "50%",
            willChange: "transform",
          }}
        >
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#B8892E]" style={{ color: "#B8892E" }}>
            {hoverLabel}
          </span>
          <span className="font-serif text-3xl md:text-4xl font-semibold text-[#2A1F14] tracking-tight" style={{ fontFamily: "var(--display)", color: "#2A1F14" }}>
            {hoverTitle}
          </span>
        </div>
      </div>
    </div>
  );
}
