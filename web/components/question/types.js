const typesMap = {
    "multipleChoice": "Multiple Choice",
    "trueFalse": "True/False",
    "essay": "Essay",
    "code": "Code",
    "web": "Web",
    "database": "Database"
}

const toArray = () => {
    return Object.keys(typesMap).map((key) => ({value: key, label: typesMap[key]}))
}

export { typesMap, toArray }
