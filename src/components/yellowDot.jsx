import { useEffect, useRef, useState } from 'react';
import './yellowDot.css';
import useWindowHeight from './useWindowHeight';

const YellowDot = () => {
  const dotRef = useRef(null);
  const pathRef = useRef(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const windowHeight = useWindowHeight();

  // Determine speed multiplier based on window height
  const speedMultiplier = windowHeight >= 700 && windowHeight <= 850 ? 6.58 : 7.05;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const path = pathRef.current;
      const dot = dotRef.current;
      const pathLength = path.getTotalLength();
      const scrollPosition = currentScrollPos * speedMultiplier;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollPercentage = scrollPosition / maxScroll;

      if (scrollPercentage >= 1) {
        // User has scrolled past the end of the path
        setIsVisible(false);
        dot.style.opacity = '0';
      } else {
        // User is within the path
        setIsVisible(true);
        const point = path.getPointAtLength(scrollPercentage * pathLength);
        dot.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, speedMultiplier]);

  return (
    <div className="yellow-dot-container">
      <svg width="0" height="0">
        <path
          ref={pathRef}
          d="M 0 0 C 66 -1 168 23 207 20 C 294 31 413 24 414 81 C 442 217 395 232 413 305 C 455 692 -630 402 -747 417 C -825 404 -867 499 -788 584"
          fill="transparent"
          stroke="transparent"
          id="motionPath"
        />
      </svg>
      <div
        ref={dotRef}
        className="yellow-dot"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </div>
  );
};

export default YellowDot;

