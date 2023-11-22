import { QuestionType } from "@prisma/client"

const typesMap = {
    [QuestionType.multipleChoice]: "Multiple Choice",
    [QuestionType.trueFalse]: "True/False",
    [QuestionType.essay]: "Essay",
    [QuestionType.code]: "Code",
    [QuestionType.web]: "Web",
    [QuestionType.database]: "Database"
}

const toArray = () => {
    return Object.keys(typesMap).map((key) => ({value: key, label: typesMap[key]}))
}

const types = toArray()

const getTooltipByType = (type) => {
  const typeObject = types.find(({ value }) => value === type)
  return typeObject?.label
}

const getTextByType = (type) => typesMap[type] || 'Unknown Type'

export { typesMap, toArray, types, getTooltipByType, getTextByType }
