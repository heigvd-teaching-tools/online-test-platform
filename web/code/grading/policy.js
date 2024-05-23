import { QuestionType, MultipleChoiceGradingPolicyType } from "@prisma/client";
import MultipleChoiceGradualCreditPolicyConfig from "@/components/question/type_specific/multiple-choice/MultipleChoiceGradualCreditPolicyConfig";

class GradingPolicy {

    static policies = {
        [QuestionType.multipleChoice]: []
    }

    constructor({label, documentation, policyType}) {
        this.label = label;
        this.documentation = documentation;
        this.policyType = policyType;
    }

    static addPolicy(policy) {
        if (!GradingPolicy.policies[policy.constructor.questionType]) {
            GradingPolicy.policies[policy.constructor.questionType] = [];
        }
        GradingPolicy.policies[policy.constructor.questionType].push(policy);
    }

    static getPolicy(questionType, policyType) {
        return GradingPolicy.getPolicies(questionType)?.find(policy => policy.policyType === policyType) || null;
    }

    static getPoliciesDict(questionType) {
        return GradingPolicy.policies[questionType].map(policy => {
            return {
                label: policy.label,
                value: policy.policyType,
            }
        });
    }

    static getPolicies(questionType) {
        return GradingPolicy.policies[questionType];
    }

    extract(solution, answer) {
        throw new Error("Not implemented");
    }

    calculate(data) {
        throw new Error("Not implemented");
    }

    breakdown(data) {
        throw new Error("Not implemented");
    }

    getConfigComponent(props) {
        return null;  // Default implementation, no configuration component
    }

}


class MultipleChoicePolicy extends GradingPolicy {
    static questionType = QuestionType.multipleChoice
}



class MultipleChoiceAllOrNothingPolicy extends MultipleChoicePolicy {

    constructor({
        label, 
        documentation,  
    }) {
        super({ label, documentation, policyType: MultipleChoiceGradingPolicyType.ALL_OR_NOTHING })
        MultipleChoicePolicy.addPolicy(this)
    }

    extract(solution, answer) {
        const correctOptions = solution.options.filter((option) => option.isCorrect)

        const selectedOptions = answer.options

        const incorrectOptions = solution.options.filter(
            (option) => !option.isCorrect,
        )

        const selectedCorrectOptions = answer.options.filter((answer) =>
            correctOptions.some((option) => option.id === answer.id),
        )

        const selectedIncorrectOptions = answer.options.filter((answer) =>
            incorrectOptions.some((option) => option.id === answer.id),
        )

        return {
            selectedOptions: selectedOptions,
            correctOptions: correctOptions,
            incorrectOptions: incorrectOptions.length,
            selectedCorrectOptions: selectedCorrectOptions.length,
            selectedIncorrectOptions: selectedIncorrectOptions.length,
        }
    }

    calculate({
        solution, answer, totalPoints
    }) {

        const {
            selectedOptions,
            correctOptions,
        } = this.extract(solution, answer);

        const isAllCorrect =
            correctOptions.length === selectedOptions.length &&
            correctOptions.every((opt) =>
                selectedOptions.some((aOpt) => aOpt.id === opt.id),
            )
    
        const finalScore = isAllCorrect ? totalPoints : 0
        
        return { finalScore, isCorrect: isAllCorrect }
    }

    breakdown({
        solution, answer, totalPoints
    }) {

        const {
            correctOptions,
            incorrectOptions,
            selectedCorrectOptions,
            selectedIncorrectOptions,
        } = this.extract(solution, answer);

        const {
            finalScore
        } = this.calculate({ solution, answer, totalPoints });


        const allCorrectOptionsSelected = selectedCorrectOptions === correctOptions && selectedIncorrectOptions === 0;

        return {
            finalScore,
            breakdown: `### All-Or-Nothing Policy Calculation Breakdown

#### Variables
- Total Points: **${totalPoints}**
- **Total Correct Options**: **${correctOptions.length}**
- **Total Incorrect Options**: **${incorrectOptions}**
- **Selected Correct Options**: **${selectedCorrectOptions}**
- **Selected Incorrect Options**: **${selectedIncorrectOptions}**

#### Final Score Formula:
\`\`\`katex
\\text{Final Score} = 
\\begin{cases} 
\\text{Total Points} & \\text{if All Correct Options and No Incorrect Options} \\\\
0 & \\text{otherwise}
\\end{cases}
\`\`\`

#### Calculation Breakdown:
- All Correct Options Selected: **${allCorrectOptionsSelected ? 'Yes' : 'No'}**
- Any Incorrect Options Selected: **${selectedIncorrectOptions > 0 ? 'Yes' : 'No'}**
- **Final Score**: **${finalScore.toFixed(2)}**
            `
        }
    }
}

class MultipleChoiceGradualCreditPolicy extends MultipleChoicePolicy {

    constructor({
            label, 
            documentation,  
    }) {
        super({label, documentation, policyType: MultipleChoiceGradingPolicyType.GRADUAL_CREDIT})
        MultipleChoicePolicy.addPolicy(this)
    }

    getConfigComponent(props) {
        return <MultipleChoiceGradualCreditPolicyConfig {...props} /> 
    }

    extract(solution, answer) {
        const totalOptions = solution.options.length
        
        const correctOptions = solution.options.filter((option) => option.isCorrect)
        const incorrectOptions = solution.options.filter(
            (option) => !option.isCorrect,
        )
        
        const selectedCorrectOptions = answer.options.filter((answer) =>
            correctOptions.some((option) => option.id === answer.id),
        )
        
        const selectedIncorrectOptions = answer.options.filter((answer) =>
            incorrectOptions.some((option) => option.id === answer.id),
        )
        
        const unselectedCorrectOptions = correctOptions.filter(
            (option) => !answer.options.some((answer) => answer.id === option.id),
        )
        
        const unselectedIncorrectOptions = incorrectOptions.filter(
            (option) => !answer.options.some((answer) => answer.id === option.id),
        )
        
        const threshold = solution.gradualCreditConfig.threshold
        const negativeMarking = solution.gradualCreditConfig.negativeMarking
        
        return {
            totalOptions: totalOptions,
            selectedCorrectOptions: selectedCorrectOptions.length,
            unselectedCorrectOptions: unselectedCorrectOptions.length,
            selectedIncorrectOptions: selectedIncorrectOptions.length,
            unselectedIncorrectOptions: unselectedIncorrectOptions.length,
            threshold,
            negativeMarking,
        }
    }

    calculate({
        solution, answer, totalPoints
    }) {
    
        const {
            totalOptions, 
            selectedCorrectOptions, 
            unselectedCorrectOptions, 
            selectedIncorrectOptions, 
            unselectedIncorrectOptions, 
            threshold, 
            negativeMarking
        } = this.extract(solution, answer, totalPoints);

        const correctnessRatio = 
            (selectedCorrectOptions + unselectedIncorrectOptions) / 
            (totalOptions)

        const rawScore = totalPoints * correctnessRatio
        let finalScore = rawScore

        if (correctnessRatio < threshold / 100 && rawScore > 0) {
            finalScore = 0
        }

        if (!negativeMarking) {
            finalScore = Math.max(0, finalScore)
        }

        finalScore = Math.round(finalScore * 100) / 100

        return { finalScore, rawScore, correctnessRatio }
    }
  
    breakdown({
        solution, answer, totalPoints
    }) {

        const {
            selectedCorrectOptions,
            unselectedIncorrectOptions,
            totalOptions,
            threshold,
            negativeMarking,
        } = this.extract(solution, answer, totalPoints);

        const {
            finalScore,
            rawScore,
            correctnessRatio
        } = this.calculate({ solution, answer, totalPoints });

        return {
            finalScore,
            breakdown: `### Multiple-Choice Gradual Credit Policy Breakdown
#### Variables
- Total Points: **{totalPoints}**
- **TO** (Total Options): **${totalOptions}**
- **Cs** (Correct Selection): **${selectedCorrectOptions}**
- **Cm** (Correct Miss): **${unselectedIncorrectOptions}**
- **CR** (Correctness Ratio): **${correctnessRatio.toFixed(2)}**
- Threshold: **${threshold}%**
- Negative Marking: **${negativeMarking ? 'Enabled' : 'Disabled'}**

#### Calculation Breakdown:

\`\`\`katex
\\huge
\\frac{Cs - Cm}{\\text{TO}}
\`\`\`

\`\`\`katex
\\Large
\\text{CR} = \\frac{${selectedCorrectOptions} + ${unselectedIncorrectOptions}}{${totalOptions}} = ${correctnessRatio.toFixed(
    2,
)}  
\`\`\`

\`\`\`katex
\\Large
\\text{Raw Score} = ${totalPoints} \\times ${correctnessRatio?.toFixed(
    2,
  )} = ${rawScore.toFixed(2)}  
\`\`\`  

\`\`\`katex
\\large
\\text{Final Score} = 
\\begin{cases} 
0 & \\text{if CR} < \\frac{\\text{${threshold}}}{100} \\text{ and Raw Score > 0} \\\\
\\max(0, \\text{Raw Score}) & \\text{if Negative Marking Disabled} \\\\
\\text{Raw Score} & \\text{otherwise}
\\end{cases}
\`\`\`


#### Final Score: ${finalScore.toFixed(2)} pts
`
        }
    }
}

new MultipleChoiceAllOrNothingPolicy({
    label: "All or Nothing",
    documentation: `**All or Nothing** awards full points if all correct options are selected and no incorrect options are selected.
`
})


new MultipleChoiceGradualCreditPolicy({
    label: "Gradual Credit",
    documentation: `
**Gradual Credit** awards points based on the student's selection of correct and incorrect options:

- Points are earned for each correct option chosen.
- Points are lost for each incorrect option chosen.
- Points are earned for each incorrect option not chosen.
- Points are lost for each correct option not chosen.

#### Calculation Formula:

\`\`\`katex
\\text{CR} = \\frac{Cs - Cm + Im - Is}{TO}
\`\`\`

\`\`\`katex
\\text{Raw Score} = \\text{Total Points} \\times \\text{CR}
\`\`\`

\`\`\`katex
\\text{Final Score} = 
\\begin{cases} 
0 & \\text{if CR} < \\frac{\\text{Threshold}}{100} \\text{ and Raw Score > 0} \\\\
\\max(0, \\text{Raw Score}) & \\text{if Negative Marking Disabled} \\\\
\\text{Raw Score} & \\text{otherwise}
\\end{cases}
\`\`\`
`
})



export default GradingPolicy
