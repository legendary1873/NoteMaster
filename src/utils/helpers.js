export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-UK');
};

export const calculateStudyTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / (1000 * 60); // returns time in minutes
};

export const generateUniqueId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};