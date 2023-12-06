import { Button } from "@mui/material";
import { getObtainedPoints } from "../analytics/stats";
import Image from "next/image";
import { useCallback } from "react";

const COLUMN_SEPARATOR = ';'
const LINE_SEPARATOR = '\r'

const ExportCSV = ({ evaluation, evaluationToQuestions, participants }) => {
    const dotToComma = (value) => value.toString().replace('.', ',');

    const exportAsCSV = useCallback(() => {
        
        let csv = `Name${COLUMN_SEPARATOR}Email${COLUMN_SEPARATOR}Success Rate${COLUMN_SEPARATOR}Total Points${COLUMN_SEPARATOR}Obtained Points${COLUMN_SEPARATOR}`
        evaluationToQuestions.forEach(
            (jstq) => (csv += `Q${jstq.order + 1}${COLUMN_SEPARATOR}`)
        )
        csv += LINE_SEPARATOR

        participants.forEach((participant) => {
            let obtainedPoints = getObtainedPoints(evaluationToQuestions, participant)

            let totalPoints = evaluationToQuestions.reduce(
            (acc, jstq) => acc + jstq.points,
            0
            )
            let participantSuccessRate =
            totalPoints > 0 ? Math.round((obtainedPoints / totalPoints) * 100) : 0

            csv += `${participant.name}${COLUMN_SEPARATOR}${participant.email}${COLUMN_SEPARATOR}${`${participantSuccessRate} %`}${COLUMN_SEPARATOR}${dotToComma(totalPoints)}${COLUMN_SEPARATOR}${dotToComma(obtainedPoints)}${COLUMN_SEPARATOR}`

            evaluationToQuestions.forEach((jstq) => {
                const studentAnswer = jstq.question.studentAnswer.find(
                    (sa) => sa.user.email === participant.email
                );
    
                let pointsObtained = "-";
                if (studentAnswer?.studentGrading && studentAnswer.studentGrading.signedBy) {
                    pointsObtained = dotToComma(studentAnswer.studentGrading.pointsObtained);
                }
    
                csv += `"${pointsObtained}"${COLUMN_SEPARATOR}`;
            });

            csv += LINE_SEPARATOR
        })

        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        let url = URL.createObjectURL(blob)
        let link = document.createElement('a')

        link.setAttribute('href', url)

        let sessionLabel = evaluation.label.replace(/ /g, '_').toLowerCase()

        link.setAttribute(
            'download',
            `evaluation-${evaluation.id}-${sessionLabel}-results.csv`
        )
        link.click()
    }, [evaluation, evaluationToQuestions, participants])

    return (
        <Button 
            color={"info"}
            onClick={exportAsCSV} 
            startIcon={<Image alt="Export" src="/svg/icons/file-csv.svg" width="22" height="22" />}
        >Export
        </Button>
    );
  };
  
  export default ExportCSV;
  