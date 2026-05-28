import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Check, X } from 'lucide-react';

const RankedApplicantsTable = ({ rankedCandidates }) => {
    return (
        <div>
            <Table>
                <TableCaption>Ranked view of applicants based on deterministic matching</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Candidate Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Matched Skills</TableHead>
                        <TableHead>Missing Skills</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        rankedCandidates && rankedCandidates.map((candidate) => (
                            <TableRow key={candidate.candidateId}>
                                <TableCell>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary font-bold">
                                        #{candidate.rank}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{candidate.name}</TableCell>
                                <TableCell>
                                    <Badge variant={candidate.score >= 80 ? "default" : candidate.score >= 50 ? "secondary" : "destructive"}>
                                        {candidate.score}% Match
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.matchedSkills?.length > 0 ? (
                                            candidate.matchedSkills.map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="bg-success/20 text-foreground border-success/40">
                                                    <Check className="w-3 h-3 mr-1" /> {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">None</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.missingSkills?.length > 0 ? (
                                            candidate.missingSkills.map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="bg-destructive/12 text-foreground border-destructive/30">
                                                    <X className="w-3 h-3 mr-1" /> {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">None</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    );
};

export default RankedApplicantsTable;
