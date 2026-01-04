import React, { useEffect, useRef } from 'react';

const TurnstileCaptcha = ({ siteKey, onVerify, onExpire }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    let widgetId = null;

    const render = () => {
      if (window.turnstile) {
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
          },
        });
      }
    };
    
    // If turnstile is already loaded, render it.
    if (window.turnstile) {
      render();
    } else {
      // If not, wait for it to load.
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onVerify, onExpire]);

  return <div ref={ref} />;
};

export default TurnstileCaptcha;