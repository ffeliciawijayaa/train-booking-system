/**
 * Returns coach seat matrix layout configuration (rows, seatLetters, aisleIndex) based on train class.
 * All classes uniform layout: 16 rows, A-B-C-D seat letters (2-2 configuration with aisle after B).
 * 
 * @param {string} trainClass - Train class (e.g. 'executive', 'business', 'economy')
 * @returns {{ rows: number, seatLetters: string[], aisleIndex: number }}
 */
export const getCoachLayout = (trainClass = 'economy') => {
    const rows = 16;
    const seatLetters = ['A', 'B', 'C', 'D'];
    const aisleIndex = 2; 

    return { rows, seatLetters, aisleIndex };
};

export default getCoachLayout;
