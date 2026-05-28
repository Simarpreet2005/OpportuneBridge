export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const USER_API_END_POINT = `${BASE_URL}/user`;
export const JOB_API_END_POINT = `${BASE_URL}/job`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/application`;
export const COMPANY_API_END_POINT = `${BASE_URL}/company`;
export const ADMIN_API_END_POINT = `${BASE_URL}/admin`;
export const RESUME_API_END_POINT = `${BASE_URL}/resume`;
export const RESUME_VERSIONS_END_POINT = `${RESUME_API_END_POINT}/versions`;
export const RESUME_UPLOAD_VERSION_END_POINT = `${RESUME_API_END_POINT}/upload-version`;
export const RESUME_SET_ACTIVE_END_POINT = `${RESUME_API_END_POINT}/set-active`;
export const RESUME_VERSION_END_POINT = `${RESUME_API_END_POINT}/version`;
export const CAREER_ASSISTANT_API_END_POINT = `${BASE_URL}/career-assistant`;
