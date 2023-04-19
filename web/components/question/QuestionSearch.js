import {useCallback, useState} from "react";
import {Box, Button, Checkbox, Stack, TextField, Typography} from "@mui/material";

const QuestionSearch = ({ onSearch }) => {

    const [searchByTitle, setSearchByTitle] = useState("");
    const [searchByContent, setSearchByContent] = useState("");

    const [searchByQuestionTypes, setSearchByQuestionTypes] = useState({
        multipleChoice: true,
        trueFalse: true,
        essay: true,
        code: true,
        web: true
    });

    const setQuestionType = useCallback((type, value) => {
        setSearchByQuestionTypes({
            ...searchByQuestionTypes,
            [type]: value
        });
    }, [searchByQuestionTypes]);

    const [searchByCodeLanguages, setSearchByCodeLanguages] = useState({
        cpp: true,
        java: true,
        python: true,
        javascript: true,
    });

    const setCodeLanguage = useCallback((language, value) => {
        setSearchByCodeLanguages({
            ...searchByCodeLanguages,
            [language]: value
        });
    }, [searchByCodeLanguages]);

    // convert json to search params


    const search = useCallback(async () => {

        const query = {}

        if(searchByTitle) {
            query.title = searchByTitle;
        }

        if(searchByContent) {
            query.content = searchByContent;
        }

        if(searchByQuestionTypes) {
            query.questionTypes = Object.keys(searchByQuestionTypes).filter((key) => searchByQuestionTypes[key]);
            if(query.questionTypes.includes("code")) {
                query.codeLanguages = Object.keys(searchByCodeLanguages).filter((key) => searchByCodeLanguages[key]);
            }
        }
        onSearch(query);
    }, [onSearch, searchByTitle, searchByContent, searchByQuestionTypes, searchByCodeLanguages]);

    return (
        <Stack spacing={2} padding={2}>
            <Typography variant="body2" color="info"> Search by text </Typography>

            <TextField
                label={"Search by title"}
                variant="outlined"
                fullWidth
                autoFocus
                color="info"
                size="small"
                value={searchByTitle}
                onChange={(e) => setSearchByTitle(e.target.value)}
            />

            <TextField
                label={"Search by content"}
                variant="outlined"
                fullWidth
                color="info"
                size="small"
                value={searchByContent}
                onChange={(e) => setSearchByContent(e.target.value)}
            />

            <Typography variant="body2" color="info"> Search by question type </Typography>
            <Box>
                <CheckboxLabel
                    label="Multiple choice"
                    checked={searchByQuestionTypes.multipleChoice}
                    onChange={(checked) => setQuestionType("multipleChoice", checked)}
                />
                <CheckboxLabel
                    label="True or false"
                    checked={searchByQuestionTypes.trueFalse}
                    onChange={(checked) => setQuestionType("trueFalse", checked)}
                />
                <CheckboxLabel
                    label="Essay"
                    checked={searchByQuestionTypes.essay}
                    onChange={(checked) => setQuestionType("essay", checked)}
                />
                <CheckboxLabel
                    label="Code"
                    checked={searchByQuestionTypes.code}
                    onChange={(checked) => setQuestionType("code", checked)}
                />
                <CheckboxLabel
                    label="Web"
                    checked={searchByQuestionTypes.web}
                    onChange={(checked) => setQuestionType("web", checked)}
                />
            </Box>
            { searchByQuestionTypes.code &&
                <>
                    <Typography variant="body2" color="info"> Search code question by language </Typography>
                    <Box>
                        <CheckboxLabel label="C++" checked={searchByCodeLanguages.cpp} onChange={(checked) => setCodeLanguage("cpp", checked)} />
                        <CheckboxLabel label="Java" checked={searchByCodeLanguages.java} onChange={(checked) => setCodeLanguage("java", checked)} />
                        <CheckboxLabel label="JavaScript" checked={searchByCodeLanguages.javascript} onChange={(checked) => setCodeLanguage("javascript", checked)} />
                        <CheckboxLabel label="Python" checked={searchByCodeLanguages.python} onChange={(checked) => setCodeLanguage("python", checked)} />
                    </Box>
                </>
            }
            <Button variant="contained" color="info" fullWidth onClick={search}> Search </Button>
        </Stack>
    )
};

const CheckboxLabel = ({label, checked, onChange}) => {
    const setToggleCheckBox = useCallback(() => onChange && onChange(!checked), [onChange]);
    return (
        <Stack direction="row" spacing={1} alignItems="center" onClick={ setToggleCheckBox } sx={{ cursor: "pointer" }}>
            <Checkbox size={"small"} checked={checked} color={"info"} onChange={(e) => onChange(e.target.checked)} />
            <Typography variant="body2" color="info"> {label} </Typography>
        </Stack>
    )
}

export default QuestionSearch;
