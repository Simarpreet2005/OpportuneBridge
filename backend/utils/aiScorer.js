/**
 * @param {Object} userProfile - { skills: [], bio: "" }
 * @param {Object} target - { techStack: [], description: "", title: "" }
 * @returns {Object} { score: Number, analysis: String }
 */
export const calculateMatchScore = (userProfile, target) => {
    let score = 0;
    let analysisPoints = [];

    const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
    const targetStack = (target.techStack || []).map(t => t.toLowerCase());
    const targetText = (target.description + " " + target.title).toLowerCase();

    // 1. Tech Stack Match (Weight: 60%)
    if (targetStack.length > 0) {
        let matchedSkills = 0;
        targetStack.forEach(tech => {
            if (userSkills.includes(tech)) {
                matchedSkills++;
            }
        });

        const stackScore = (matchedSkills / targetStack.length) * 60;
        score += stackScore;

        if (matchedSkills > 0) {
            analysisPoints.push(`Matches ${matchedSkills}/${targetStack.length} required technical skills.`);
        } else {
            analysisPoints.push("No direct technical skills matched.");
        }
    } else {
        // If no tech stack defined, give free points or base on text
        score += 30;
        analysisPoints.push("No specific tech stack requirements listed.");
    }

    // 2. Keyword/Bio Match (Weight: 40%)
    // Simple check: does user bio contain target title keywords?
    const bio = (userProfile.bio || "").toLowerCase();
    const titleKeywords = target.title.toLowerCase().split(" ").filter(w => w.length > 3);

    let matchedKeywords = 0;
    titleKeywords.forEach(word => {
        if (bio.includes(word) || userSkills.includes(word)) {
            matchedKeywords++;
        }
    });

    const keywordScore = Math.min((matchedKeywords / (titleKeywords.length || 1)) * 40, 40);
    score += keywordScore;

    if (matchedKeywords > 0) {
        analysisPoints.push("Profile content aligns with the challenge topic.");
    }

    // 3. Normalize Score
    score = Math.min(Math.round(score), 100);

    // Bonus for high overlap
    if (score > 80) analysisPoints.push("Strong Match! You are well-equipped for this.");
    else if (score < 40) analysisPoints.push("This might be a stretch, but a great learning opportunity.");

    return {
        score,
        analysis: analysisPoints.join(" ")
    };
};
