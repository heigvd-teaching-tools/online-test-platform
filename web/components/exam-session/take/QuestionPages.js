import Image from 'next/image';
import { useRouter } from "next/router";
import { Tabs, Tab, Stack } from "@mui/material";


const QuestionPages = ({ count, page, hasAnswered }) => {
    const router = useRouter();
    return (
        <Tabs
            value={page - 1}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(e, page) => router.push(`/exam-sessions/${router.query.sessionId}/take/${page + 1}`)}
        >
            {Array.from(Array(count).keys()).map((_, index) => (
                <Tab
                    key={index}
                    label={`Q${index + 1}`}	
                    iconPosition="start"
                    sx={{ minHeight: '50px', minWidth: 0 }}
                    icon={
                    <Stack sx={{ width: '20px', height: '20px' }} alignItems="center" justifyContent="center">
                        { 
                        hasAnswered(index + 1) ? 
                            <Image src="/svg/answer/present.svg" alt="Answer present" layout="fixed" width={12} height={12} />                    
                            : 
                            <Image src="/svg/answer/empty.svg" alt="Answer empty" layout="fixed" width={12} height={12} />                
                        }
                    </Stack> 
                }
                />
            ))}
        </Tabs>
    )
};

export default QuestionPages;