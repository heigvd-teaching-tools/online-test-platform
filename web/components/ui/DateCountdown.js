import { useState, useEffect } from 'react';

const DateCountdown = ({ untilDate }) => {
    const [ timeLeft, setTimeLeft ] = useState();

    const calculateTimeLeft = () => {
        const difference = new Date(untilDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer);
    });

    return (
    <>
        {timeLeft && (
            <>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</>
        )}
    </>
    );

}

export default DateCountdown;