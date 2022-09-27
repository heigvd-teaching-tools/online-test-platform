import { useState, useEffect } from 'react';
import { StudentQuestionGradingStatus } from '@prisma/client';
import Image from 'next/image';
import { Button, Collapse, Box, Paper, Stack, TextField, Typography, Chip, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import GradingStatus from './GradingStatus';

import ClearIcon from '@mui/icons-material/Clear';
import UserAvatar from '../../layout/UserAvatar';

import { useSession } from "next-auth/react";

const GradingSignOff = ({ grading:initial, maxPoints, onSignOff }) => {
    
    const [ grading, setGrading ] = useState(initial);
    const { data } = useSession();

    useEffect(() => {
        setGrading(initial);        
    }, [initial]);

    const signOffGrading = () => {

        let status = grading.status;
        switch(grading.status) {
            case StudentQuestionGradingStatus.UNGRADED:
                status = StudentQuestionGradingStatus.GRADED;
                break;
            case StudentQuestionGradingStatus.AUTOGRADED:
                if(grading.pointsObtained !== initial.pointsObtained) {
                    status = StudentQuestionGradingStatus.GRADED;
                }
                break;
            default:
                break;
        }

        let newGrading = {
            ...grading,
            isCorrect: grading.pointsObtained === maxPoints,
            status: status,
            signedBy: data.user
        }
        setGrading(newGrading);
        onSignOff(newGrading);
    }

    return (
        <Paper 
            sx={{
                flex:1
            }}
            square
            >
            { grading && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height:'100%', p:1, p:2 }} spacing={2} >
                <Stack direction="row">
                    
                {
                    grading.signedBy ? (
                        <GradingSigned 
                            signedBy={grading.signedBy} 
                            grading={grading} 
                            onUnsign={() => {
                                let newGrading = { 
                                    ...grading,
                                    signedBy: undefined,
                                };
                                setGrading(newGrading);
                                onSignOff(newGrading);
                            }}
                        />
                    ) : 
                        <LoadingButton
                            color='success'
                            variant="contained"
                            loading={false}
                            loadingPosition="start"
                            startIcon={
                                <Image 
                                    src="/svg/grading/sign-off.svg"
                                    alt="Sign Off"
                                    layout="fixed" width={16} height={16}
                                />
                            }
                            onClick={signOffGrading}
                        >
                            Sign Off
                        </LoadingButton>
                    
                }
                </Stack>
                               
                {
                    !grading.signedBy && (
                    <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>   
                        <Box>
                            <TextField
                                label="Pts"
                                id="filled-points"
                                type="number"
                                variant="filled"
                                value={grading.pointsObtained}
                                InputProps={{
                                    sx:{ pr:2 },
                                    inputProps: {
                                        min: 0,
                                        max: maxPoints,
                                        sx:{ minWidth: 30 }
                                    },
                                    endAdornment: <InputAdornment position="end" sx={{ mt:2.2 }}>/ {maxPoints}</InputAdornment>,
                                }}                            
                                onChange={(event) => {
                                    let points = parseInt(event.target.value);
                                    if (points > maxPoints) {
                                        points = maxPoints;
                                    }
                                    if(points < 0) {
                                        points = 0;
                                    }
                                    let newGrading = {
                                        ...grading,
                                        pointsObtained: points
                                    }
                                    setGrading(newGrading);
                                }}
                            />
                        </Box>
                        <TextField
                            label="Comment"
                            fullWidth
                            multiline
                            variant="filled"
                            value={grading.comment}
                            onChange={(event) => {
                                let newGrading = {
                                    ...grading,
                                    comment: event.target.value
                                }
                                setGrading(newGrading);
                            }}
                            
                        />
                    </Stack>
                )}
                {
                    grading.signedBy && (
                        <GradingPointsComment points={grading.pointsObtained} maxPoints={maxPoints} comment={grading.comment} />
                    )
                }
                
                <GradingStatus grading={grading} />  
                
            </Stack>
            )}
        </Paper>
    )
}


const GradingPointsComment = ({ points, maxPoints, comment }) => {
    let color = points > 0 ? 'success' : 'error';
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Chip 
                variant='outlined'
                
                color={color} label={
                    <>
                        <Typography variant="body2" component="span" sx={{ mr:1 }}><b>{points}</b></Typography>
                        <Typography variant="caption" component="span">/ {maxPoints} pts</Typography>
                    </>
                }
            />
            <Typography variant="body2" sx={{ color:'text.secondary' }}>{comment}</Typography>
        </Stack>
    )
}

const GradingSigned = ({ signedBy, onUnsign }) => {
    const [ expanded, setExpanded ] = useState(false);
    return (
        <Stack 
            direction="row" alignItems="center" spacing={1}
            sx={{ cursor:'pointer', height:'100%', borderRadius:1 }}
            onMouseOver={() => setExpanded(true)}
            onMouseOut={() => setExpanded(false)}
            >
            
            <UserAvatar
                collapsed={!expanded}
                user={signedBy}
                size={32}
            />
            <Box>
            <Image 
                src="/svg/grading/signed-off.svg"  
                alt="Signed Off"
                layout="fixed" width={32} height={32}
            />
            </Box>
            <Collapse 
                in={expanded} timeout="auto" unmountOnExit
                orientation='horizontal'
                >
            <Button 
                size="small"
                id="grading-sign-off-remove"
                startIcon={<ClearIcon sx={{ color: 'error.main', width:24, height:24 }} />}
                onClick={onUnsign}
            >
                <Typography variant="body1">Unsign</Typography>
            </Button>
            </Collapse>
        </Stack>
    )
}

export default GradingSignOff;