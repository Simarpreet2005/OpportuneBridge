import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sparkles, Award, TrendingUp, Lightbulb } from 'lucide-react';
import api from '../services/api';

const SkillGapInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const res = await api.get('/skill-gap/insights');
                setInsights(res.data);
            } catch (error) {
                console.error("Failed to fetch skill gap insights", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground text-sm">Analyzing market requirements...</p>
                </CardContent>
            </Card>
        );
    }

    if (!insights) return null;

    const { currentSkills, missingSkills, advice } = insights;

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Skill Insights & Market Alignment</CardTitle>
                </div>
                <CardDescription>
                    Compare your profile skills with active marketplace requirements
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Skills */}
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-success" />
                        Your Current Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {currentSkills.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No skills specified in your profile. Update your profile to get matched!</span>
                        ) : (
                            currentSkills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-success/30 bg-success/10 text-success">
                                    {skill}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                {/* Missing Skills */}
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-warning" />
                        In-Demand Skills You're Missing
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {missingSkills.length === 0 ? (
                            <span className="text-xs text-muted-foreground">You match all requirements for current listings!</span>
                        ) : (
                            missingSkills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-warning/30 bg-warning/10 text-black dark:text-white">
                                    + {skill}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                {/* Career Assistant Commentary */}
                {advice && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-3 items-start">
                        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">Career Assistant Advice</p>
                            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                {advice}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SkillGapInsights;
