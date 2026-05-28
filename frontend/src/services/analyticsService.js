import api from "./api";

export const getRecruiterAnalytics = async (timeRange = "all") => {
    const { data } = await api.get(`/analytics/recruiter?timeRange=${timeRange}`);
    return data.analytics;
};
