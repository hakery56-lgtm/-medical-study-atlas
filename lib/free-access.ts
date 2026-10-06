// Login is switched off for everyone until this moment (Jan 1, 2027, midnight Baghdad time), then turns back on by itself.
export const FREE_ACCESS_UNTIL = new Date("2027-01-01T00:00:00+03:00")

export const isFreeAccess = (now = new Date()) => now < FREE_ACCESS_UNTIL
