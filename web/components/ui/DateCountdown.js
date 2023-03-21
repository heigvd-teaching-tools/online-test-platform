import { useState, useEffect } from 'react';
const DateCountdown = ({ untilDate, onTic, onFinish }) => {
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
        }else{
            timeLeft = {
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
            if(onFinish){
                onFinish();
            }
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            let timeLeft = calculateTimeLeft();
            setTimeLeft(timeLeft);
            if(onTic){
                onTic(timeLeft);
            }
        }, 1000);
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer);
    });

    return (
    <>
        {timeLeft && (
            <>{`${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}`}</>
        )}
    </>
    );

}

export default DateCountdown;
