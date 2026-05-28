import { calculateSkillGap } from "../services/skillGap.service.js";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";

export const getSkillGapInsights = async (req, res) => {
    try {
        const userId = req.id;
        const insights = await calculateSkillGap(userId);
        return res.status(200).json(insights);
    } catch (error) {
        logger.error("getSkillGapInsights Controller Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};
