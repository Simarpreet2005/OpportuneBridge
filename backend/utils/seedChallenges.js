import mongoose from "mongoose";
import dotenv from "dotenv";
import { Challenge } from "../models/challenge.model.js";
import connectDB from "./db.js";

dotenv.config();

const challenges = [
    {
        title: "Build a React Kanban Board",
        description: "Create a fully functional Kanban board using React. It should have drag-and-drop functionality, the ability to add new tasks, and persistence using local storage. Focus on component breakdown and state management.",
        difficulty: "Medium",
        techStack: ["React", "CSS", "JavaScript"],
        boilerplateCode: {
            python: "# Not applicable for frontend challenge",
            javascript: "// Start coding your React components here\n\nimport React from 'react';\n\nconst Board = () => {\n  return <div>Kanban Board</div>;\n};\n\nexport default Board;"
        },
        testCases: [
            { input: "Add Task 'Test'", output: "Task appears in 'Todo' column", isHidden: false },
            { input: "Drag Task to 'Done'", output: "Task moves to 'Done' column", isHidden: false }
        ],
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2039&auto=format&fit=crop"
    },
    {
        title: "Two Sum: Algorithm Sprint",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        techStack: ["Python", "Algorithms", "Data Structures"],
        boilerplateCode: {
            python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass"
        },
        testCases: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", isHidden: false },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", isHidden: false }
        ],
        image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop"
    },
    {
        title: "System Design: URL Shortener",
        description: "Design a scalable URL shortening service like Bit.ly. Discuss the database schema, API design, and how to handle high traffic. This is a text-based design challenge.",
        difficulty: "Hard",
        techStack: ["System Design", "Scalability", "Database"],
        boilerplateCode: {
            python: "# Write your system design proposal within comments or print statements"
        },
        testCases: [],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Python API with FastAPI",
        description: "Build a simple REST API using FastAPI that has an endpoint `/items/{item_id}` to returns an item. Implement input validation using Pydantic models.",
        difficulty: "Medium",
        techStack: ["Python", "FastAPI", "REST API"],
        boilerplateCode: {
            python: "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/')\ndef read_root():\n    return {'Hello': 'World'}"
        },
        testCases: [
            { input: "GET /items/1", output: "200 OK", isHidden: false }
        ],
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2074&auto=format&fit=crop"
    },
    {
        title: "Advanced CSS Layouts",
        description: "Replicate a complex magazine layout using CSS Grid. Ensure it is fully responsive on mobile devices.",
        difficulty: "Hard",
        techStack: ["CSS", "HTML", "Responsive Design"],
        boilerplateCode: {
            javascript: "/* Add your CSS here */"
        },
        testCases: [],
        image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2070&auto=format&fit=crop"
    }
];

const seedChallenges = async () => {
    try {
        await connectDB();
        
        await Challenge.insertMany(challenges);
        console.log(`Seeded ${challenges.length} challenges successfully.`);

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
};

seedChallenges();
