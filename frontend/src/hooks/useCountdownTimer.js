import { useState, useEffect } from 'react';

/**
 * Custom hook to manage countdown timer for an expiration date string or timestamp.
 * 
 * @param {string|number|null} expiredAt - Expiration timestamp or string (e.g. 'YYYY-MM-DD HH:MM:SS')
 * @returns {{ timeLeft: string, isExpired: boolean }}
 */
export const useCountdownTimer = (expiredAt) => {
    const [timeLeft, setTimeLeft] = useState('--:--');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!expiredAt) {
            setTimeLeft('--:--');
            setIsExpired(false);
            return;
        }

        const calcTime = () => {
            const now = new Date().getTime();
            const expiredTime = typeof expiredAt === 'string'
                ? new Date(expiredAt.replace(/-/g, "/")).getTime()
                : new Date(expiredAt).getTime();

            const distance = expiredTime - now;

            if (distance <= 0) {
                setTimeLeft('00:00');
                setIsExpired(true);
                return true;
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setIsExpired(false);
                return false;
            }
        };

        const expired = calcTime();
        if (expired) return;

        const interval = setInterval(() => {
            const isDone = calcTime();
            if (isDone) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiredAt]);

    return { timeLeft, isExpired };
};

export default useCountdownTimer;
