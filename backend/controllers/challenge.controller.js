import { Challenge } from "../models/challenge.model.js";


export const createChallenge = async (req, res) => {
    try {
        const { title, description, difficulty, techStack, boilerplateCode, testCases } = req.body;

        if (!title || !description || !difficulty || !testCases) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const challenge = await Challenge.create({
            title,
            description,
            difficulty,
            techStack,
            boilerplateCode,
            testCases
        });

        return res.status(201).json({
            message: "Challenge created successfully.",
            challenge,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
            challenges,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}


export const getChallengeById = async (req, res) => {
    try {
        const challengeId = req.params.id;
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({
                message: "Challenge not found.",
                success: false
            })
        }
        return res.status(200).json({
            challenge,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}
