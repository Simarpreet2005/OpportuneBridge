const BASE_URL = import.meta.env.VITE_API_URL || "https://opportunebridge-backend.onrender.com/api/v1";

export const USER_API_END_POINT = `${BASE_URL}/user`;
export const JOB_API_END_POINT = `${BASE_URL}/job`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/application`;
export const COMPANY_API_END_POINT = `${BASE_URL}/company`;
export const CHALLENGE_API_END_POINT = `${BASE_URL}/challenge`;
export const POST_API_END_POINT = `${BASE_URL}/post`;
export const SUPERADMIN_API_END_POINT = "https://opportunebridge-backend.onrender.com/api/v1/superadmin";