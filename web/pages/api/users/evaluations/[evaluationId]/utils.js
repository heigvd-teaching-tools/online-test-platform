import { UserOnEvaluatioAccessMode } from "@prisma/client";

export const isStudentAllowed = (evaluation, studentEmail) => evaluation.accessMode === UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST ? evaluation.accessList?.includes(studentEmail) : true;