import {Box, Paper, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getQuestionSuccessRate, typeSpecificStats} from "../pages/stats";
import {QuestionType, StudentAnswerStatus} from "@prisma/client";
import Image from "next/image";
import PiePercent from "../../feedback/PiePercent";

const ExamSessionAnalytics = ({questions}) => {
    return(
        <Stack spacing={8} alignItems="center" sx={{ width : '100%', mt:8 }}>
            { questions.map((question, index) => <QuestionAnalytics key={index} question={question} />) }
        </Stack>
    )
}

const QuestionAnalytics = ({ question }) => {
    const [ questionData, setQuestionData ] = useState(null);
    useEffect(() => {
        if(question){
            let data = {
                label: `Q${question.order + 1}`,
                type: question.type,
                [question.type]: typeSpecificStats(question)
            };
            switch(question.type) {
                case QuestionType.multipleChoice: {
                    let maxValue = Math.max(...data[question.type].map((option) => option.chosen));
                    data[question.type] = data[question.type].map((option) => ({ ...option, percentage: maxValue > 0 ? Math.round(option.chosen / maxValue * 100) : 0 }));
                    break;
                }
                case QuestionType.trueFalse: {
                    let maxValue = Math.max(data[question.type].true.chosen, data[question.type].false.chosen);
                    data[question.type].true.percentage = maxValue > 0 ? Math.round(data[question.type].true.chosen / maxValue * 100) : 0;
                    data[question.type].false.percentage = maxValue > 0 ? Math.round(data[question.type].false.chosen / maxValue * 100) : 0;
                    break;
                }
                case QuestionType.code: {
                    let maxValue = Math.max(data[question.type].success.count, data[question.type].failure.count);
                    data[question.type].success.percentage = maxValue > 0 ? Math.round(data[question.type].success.count / maxValue * 100) : 0;
                    data[question.type].failure.percentage = maxValue > 0 ? Math.round(data[question.type].failure.count / maxValue * 100) : 0;
                    break;
                }
                case QuestionType.essay: {
                    let maxValue = Math.max(data[question.type].submitted.count, data[question.type].missing.count);
                    data[question.type].submitted.percentage = maxValue > 0 ? Math.round(data[question.type].submitted.count / maxValue * 100) : 0;
                    data[question.type].missing.percentage = maxValue > 0 ? Math.round(data[question.type].missing.count / maxValue * 100) : 0;
                    break;
                }
                default:
                    break;
            }
            setQuestionData(data);
        }
    }, [question]);

    return (
        <Paper sx={{ p:2, width:'70%' }}>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width:'32px', height:'32px' }}>
                        <Image src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                    </Box>
                    <Typography variant="h6"><b>{`Q${question.order + 1}`}</b></Typography>

                    <Typography variant="body2">
                        Submitted Answers :
                        { question.studentAnswer.filter((sa) => sa.status === StudentAnswerStatus.SUBMITTED).length}
                        /
                        {question.studentAnswer.length}
                    </Typography>
                </Stack>
                { questionData &&
                    (
                        (questionData.type === QuestionType.multipleChoice && (
                            <Stack direction="column" alignItems="flex-start" spacing={2} >
                                {
                                    questionData[questionData.type].map((option, index) => (
                                        <AnalyticsRow
                                            key={index}
                                            label={option.label}
                                            percent={option.percentage}
                                            amount={option.chosen}
                                        />
                                    ))
                                }
                            </Stack>
                        ))
                        ||
                        (questionData.type === QuestionType.trueFalse && (
                            <>
                                <AnalyticsRow
                                    label="True"
                                    percent={questionData[questionData.type].true.percentage}
                                    amount={questionData[questionData.type].true.chosen}
                                />
                                <AnalyticsRow
                                    label="False"
                                    percent={questionData[questionData.type].false.percentage}
                                    amount={questionData[questionData.type].false.chosen}
                                />
                            </>
                        ))
                        ||
                        (questionData.type === QuestionType.code && (
                            <>
                                <AnalyticsRow
                                    label="Success"
                                    color="success"
                                    percent={questionData[questionData.type].success.percentage}
                                    amount={questionData[questionData.type].success.count}
                                />
                                <AnalyticsRow
                                    label="Failure"
                                    color="error"
                                    percent={questionData[questionData.type].failure.percentage}
                                    amount={questionData[questionData.type].failure.count}
                                />
                            </>
                        ))
                        ||
                        (questionData.type === QuestionType.essay && (
                            <>
                                <AnalyticsRow
                                    label="Submitted"
                                    color="success"
                                    percent={questionData[questionData.type].submitted.percentage}
                                    amount={questionData[questionData.type].submitted.count}
                                />
                                <AnalyticsRow
                                    label="Missing"
                                    color="error"
                                    percent={questionData[questionData.type].missing.percentage}
                                    amount={questionData[questionData.type].missing.count}
                                />
                            </>
                        ))
                    )
                }
                <Stack direction="row" spacing={1} alignItems="center">
                    <PiePercent value={ getQuestionSuccessRate(question) } />
                    <Typography variant="body1">Success Rate</Typography>
                </Stack>
            </Stack>
        </Paper>
    )
}

const AnalyticsRow = ({ label, percent, amount, color = 'info' }) =>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ width:'100%' }}>
        <Box sx={{ width:60, maxWidth:60 }}>
            <Typography variant="body1">{label}</Typography>
        </Box>
        <Stack sx={{ flex:1 }} direction="row" spacing={2} alignItems="center">
            <LinearPercent percent={percent} thickness={15} color={color}/>
            <Box sx={{ minWidth: 35, width:35 }}>
                <Typography variant="caption" sx={{ textAlign:'center' }}><b>{amount}</b></Typography>
            </Box>
        </Stack>
    </Stack>

const LinearPercent = ({ percent, thickness = 10, color = 'info' }) =>
    <Stack sx={{ flex:1 }}>
        <Box sx={{ width:'100%', height:thickness, backgroundColor:'grey.200', borderRadius:thickness, overflow:'hidden' }}>
            <Box sx={{ height: thickness, width: `${percent}%`, bgcolor:`${color}.main` }} color={color}/>
        </Box>
    </Stack>

export default ExamSessionAnalytics;