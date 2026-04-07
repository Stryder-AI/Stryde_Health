import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionClass, setTransitionClass] = useState('page-transition');
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      // Start exit animation
      setTransitionClass('page-transition-exit');

      const timeout = setTimeout(() => {
        // Swap content and start enter animation
        setDisplayChildren(children);
        setTransitionClass('page-transition');
        prevLocation.current = location.pathname;
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return <div className={transitionClass}>{displayChildren}</div>;
}
