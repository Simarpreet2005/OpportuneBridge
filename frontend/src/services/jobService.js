import api from "./api";

export const getJobs = async (params = {}) => {
    const { data } = await api.get("/job/get", { params });
    return data;
};

export const getAdminJobs = async () => {
    const { data } = await api.get("/job/getadminjobs");
    return data.jobs || [];
};

export const getAppliedJobs = async () => {
    const { data } = await api.get("/application/get");
    return data.application || [];
};

export const getMatchScore = async ({ targetId, targetType }) => {
    const { data } = await api.post("/ai/score", { targetId, targetType });
    return data;
};
