

const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};


const weeksAgo = (label) => {
    const parts = label.split('_');
    const year = parseInt(parts[1], 10);
    const weekNumber = parseInt(parts[3], 10);
    const currentYear = new Date().getFullYear();
    const currentWeekNumber = getWeekNumber(new Date());

    // Calculate the difference in weeks considering the year
    const weeksAgo = (currentYear - year) * 52 + (currentWeekNumber - weekNumber);

    switch (weeksAgo) {
        case 0:
        return 'This week';
        case 1:
        return 'Last week';
        default:
        return `${weeksAgo} weeks ago`;
    }
};

export { getWeekNumber, weeksAgo }