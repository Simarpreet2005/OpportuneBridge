export const calculateTotalExperienceMonths = (experiences) => {
    if (!experiences || experiences.length === 0) return 0;

    // Extract valid intervals
    const intervals = [];
    experiences.forEach(exp => {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent || !exp.endDate ? new Date() : new Date(exp.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            intervals.push({ start: start.getTime(), end: end.getTime() });
        }
    });

    if (intervals.length === 0) return 0;

    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const lastMerged = merged[merged.length - 1];

        if (current.start <= lastMerged.end) {
            // Overlapping, extend the end time if necessary
            lastMerged.end = Math.max(lastMerged.end, current.end);
        } else {
            // Disjoint interval
            merged.push(current);
        }
    }

    // Calculate total months
    let totalMonths = 0;
    merged.forEach(interval => {
        const start = new Date(interval.start);
        const end = new Date(interval.end);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += months;
    });

    return totalMonths;
};

export const calculateTotalExperienceYears = (experiences) => {
    return calculateTotalExperienceMonths(experiences) / 12;
};
