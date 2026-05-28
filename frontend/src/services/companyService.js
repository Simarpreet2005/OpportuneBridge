import api from "./api";

export const getCompanies = async () => {
    const { data } = await api.get("/company/get");
    return data.companies || [];
};

export const getCompanyById = async (companyId) => {
    const { data } = await api.get(`/company/get/${companyId}`);
    return data.company;
};
