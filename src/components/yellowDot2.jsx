import { useEffect, useRef, useState } from 'react';
import './yellowDot2.css';
import useWindowHeight from './useWindowHeight';

const YellowDot2 = () => {
  const dotRef = useRef(null);
  const pathRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const windowHeight = useWindowHeight();

  // Determine speed multiplier based on window height
  const speedMultiplier = windowHeight >= 700 && windowHeight <= 850 ? 2.80 : 2.93;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const path = pathRef.current;
      const dot = dotRef.current;
      const pathLength = path.getTotalLength();
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      // Check if the current scroll position is greater than or equal to 700px
      if (currentScrollPos >= 580 && currentScrollPos <= 1220) {
        if (!isVisible) {
          setIsVisible(true);
          dot.style.opacity = '1';
        }
        const scrollPercentage = ((currentScrollPos - 580) * speedMultiplier) / (maxScroll - 700);
        const point = path.getPointAtLength(scrollPercentage * pathLength);
        dot.style.transform = `translate(${point.x}px, ${point.y}px)`;
      } else {
        if (isVisible) {
          setIsVisible(false);
          dot.style.opacity = '0';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, speedMultiplier]);

  return (
    <div className="yellow-dot2-container">
      <svg width="0" height="0">
        <path
          ref={pathRef}
          d="M 0 0 C 178 53 413 -72 439 155 C 496 21 528 -39 603 155 C 703 -82 808 34 869 155 C 939 -132 1147 -48 1169 93 C 1281 614 1425 864 1064 760 C 888 747 774 666 625 931 C 557 811 551 798 535 770 C 508 713 495 694 490 681 C 467 716 436 790 408 931 C 374.6667 783.3333 371 759 311 695 C 282 664 216 615 152 688 C 92 790 -316 663 -134 984"
          fill="transparent"
          stroke="transparent"
          id="motionPath"
        />
      </svg>
      <div
        ref={dotRef}
        className="yellow-dot2"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </div>
  );
};

export default YellowDot2;


