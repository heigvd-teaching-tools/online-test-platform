import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Collapse, Box, Paper, Stack, TextField, Typography, Chip } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import RateReviewSharpIcon from '@mui/icons-material/RateReviewSharp';
import GradingStatus from './GradingStatus';

import ClearIcon from '@mui/icons-material/Clear';
import UserAvatar from '../../layout/UserAvatar';

import { useSession } from "next-auth/react";


const GradingSignOff = ({ grading, onSignOff }) => {
    const [ comment, setComment ] = useState();
    const [ points, setPoints ] = useState();
    const [ signedBy, setSignedBy ] = useState();

    const { data, status } = useSession();

    useEffect(() => {
        setComment(grading && grading.comment || '');
        setPoints(grading && grading.pointsObtained);
        setSignedBy(grading && grading.signedBy || undefined);
    }, [grading]);

    useEffect(() => {
        console.log('GradingSignOff signedBy', signedBy, grading);
            
        
    }, [signedBy]);

    return (
        <Paper 
            square
            sx={{ 
                position:'absolute', 
                bottom:0, left:0, right:0, 
                height: 90 
            }}>
            { grading && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height:'100%', p:2 }} spacing={4} >
                {
                    signedBy ? (
                        <GradingSigned 
                            signedBy={signedBy} 
                            grading={grading} 
                            onUnsign={() => {
                                setSignedBy(undefined);
                                onSignOff({
                                    ...grading,
                                    signedBy: undefined
                                });
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
                            onClick={async () => {
                                setSignedBy(data.user);
                                onSignOff({
                                    ...grading,
                                    comment,
                                    pointsObtained: points,
                                    signedBy: data.user,
                                });
                            }}
                        >
                            Sign Off
                        </LoadingButton>
                    
                }
                {
                    !signedBy && (
                    <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>   
                        <TextField
                            sx={{width:60}}
                            id="outlined-points"
                            label="Points"
                            type="number"
                            variant="filled"
                            value={points}
                            onChange={(event) => {
                                setPoints(event.target.value);
                            }}
                        />

                        <TextField
                            label="Comment"
                            fullWidth
                            multiline
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            variant="filled"
                        />
                    </Stack>
                )}
                {
                    signedBy && (
                        <GradingPointsComment points={points} comment={comment} />
                    )
                }
                
                <GradingStatus grading={grading} />  
            </Stack>
            )}
        </Paper>
    )
}

const GradingPointsComment = ({ points, comment }) => {
    let color = points > 0 ? 'success' : 'error';
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Chip 
                variant='outlined'
                
                color={color} label={`${points} pts`}
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
            sx={{ cursor:'pointer', height:'100%', pl:2, pr:2, borderRadius:1 }}
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