import Image from 'next/image';
import { useRouter } from "next/router";
import { Tabs, Tab, Stack } from "@mui/material";
import FilledBullet from '../../feedback/FilledBullet';


const QuestionPages = ({ count, page, link, isFilled }) => {
    const router = useRouter();
    return (
        <Tabs
            value={page - 1}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(e, index) => router.push(link(index + 1))}
        >
            {Array.from(Array(count).keys()).map((_, index) => (
                <Tab
                    key={index}
                    label={`Q${index + 1}`}	
                    iconPosition="start"
                    sx={{ minHeight: '50px', minWidth: 0 }}
                    icon={
                        <FilledBullet 
                            index={index}
                            isFilled={isFilled} 
                        />
                    }
                />
            ))}
        </Tabs>
    )
};


export default QuestionPages;