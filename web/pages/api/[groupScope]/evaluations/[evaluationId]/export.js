/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Role } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'

import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'

import { IncludeStrategy, questionIncludeClause } from '@/code/questions'
import muiTheme from '@/code/evaluation/muiTheme.json'
import {
  calculateObtainedPoints,
  calculateTotalPoints,
  chunkQuestions,
  countDatabasePassedTests,
  equals,
  formatCode,
  formatMarkdown,
  formatQuestionType,
} from '@/code/evaluation/export/helpers'
import mainTempate from '@/code/evaluation/export/templates/main.hbs'
import stylesTemplate from '@/code/evaluation/export/templates/styles.hbs'
import studentCoverTemplate from '@/code/evaluation/export/templates/studentCover.hbs'
import studentTemplate from '@/code/evaluation/export/templates/student.hbs'
import questionTemplate from '@/code/evaluation/export/templates/question.hbs'
import studentAnswerHeaderTemplate from '@/code/evaluation/export/templates/studentAnswerHeader.hbs'
import codeBlocTemplate from '@/code/evaluation/export/templates/codeBloc.hbs'
import studentAnswerCodeWritingTemplate from '@/code/evaluation/export/templates/studentAnswerCodeWriting.hbs'
import studentAnswerCodeReadingTemplate from '@/code/evaluation/export/templates/studentAnswerCodeReading.hbs'
import studentAnswerEssayTemplate from '@/code/evaluation/export/templates/studentAnswerEssay.hbs'
import studentAnswerMultipleChoiceTemplate from '@/code/evaluation/export/templates/studentAnswerMultipleChoice.hbs'
import studentAnswerTrueFalseTemplate from '@/code/evaluation/export/templates/studentAnswerTrueFalse.hbs'
import studentAnswerWebTemplate from '@/code/evaluation/export/templates/studentAnswerWeb.hbs'
import studentAnswerDatabaseTemplate from '@/code/evaluation/export/templates/studentAnswerDatabase.hbs'
import gradingTemplate from '@/code/evaluation/export/templates/grading.hbs'

const OUTPUT_FORMAT = 'pdf' // 'html' or 'pdf'

const generatePDF = async (html, header) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  page.setDefaultTimeout(1800000)

  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 1800000 })

  // Adjust styles for @page directive
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @page {
        size: A4;
      }
      @page:first {
        @bottom-left { content: ""; } /* Hide the email on the first page if desired */
        @bottom-right { content: ""; } /* Optional: Exclude number on the first page */
      }
    `
    document.head.appendChild(style)
  })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      bottom: '10mm',
      left: '5mm',
      right: '5mm',
      top: '10mm',
    },
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; color: #aaa;">
        <span style="float: left; margin-left: 20px;">eval@heig-vd.ch</span>
        <span style="float: right; margin-right: 20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    headerTemplate: `<div style="display:flex;justify-content:space-between;width:100%;font-size: 12px; color: #333; margin:0 20px 0 20px;"><div>${header}</div><div>EVAL</div></div>`,
  })

  await browser.close()
  return pdfBuffer
}

// PARTIALS
Handlebars.registerPartial('styles', stylesTemplate)
Handlebars.registerPartial('studentInfo', studentTemplate)
Handlebars.registerPartial('studentCover', studentCoverTemplate)
Handlebars.registerPartial('questionHeader', questionTemplate)
Handlebars.registerPartial('codeBloc', codeBlocTemplate)
Handlebars.registerPartial('studentAnswerHeader', studentAnswerHeaderTemplate)
Handlebars.registerPartial(
  'studentAnswerCodeWriting',
  studentAnswerCodeWritingTemplate,
)
Handlebars.registerPartial(
  'studentAnswerCodeReading',
  studentAnswerCodeReadingTemplate,
)
Handlebars.registerPartial('studentAnswerEssay', studentAnswerEssayTemplate)
Handlebars.registerPartial(
  'studentAnswerMultipleChoice',
  studentAnswerMultipleChoiceTemplate,
)
Handlebars.registerPartial(
  'studentAnswerTrueFalse',
  studentAnswerTrueFalseTemplate,
)
Handlebars.registerPartial('studentAnswerWeb', studentAnswerWebTemplate)
Handlebars.registerPartial(
  'studentAnswerDatabase',
  studentAnswerDatabaseTemplate,
)
Handlebars.registerPartial('studentAnswerGrading', gradingTemplate)

// HELPER FUNCTIONS
Handlebars.registerHelper('formatCode', formatCode)
Handlebars.registerHelper('formatMarkdown', formatMarkdown)
Handlebars.registerHelper('eq', equals)
Handlebars.registerHelper('formatQuestionType', formatQuestionType)
Handlebars.registerHelper('countDatabasePassedTests', countDatabasePassedTests)
Handlebars.registerHelper('chunkQuestions', chunkQuestions)
Handlebars.registerHelper('calculateTotalPoints', calculateTotalPoints)
Handlebars.registerHelper('calculateObtainedPoints', calculateObtainedPoints)

const get = async (req, res, prisma) => {
  const { groupScope, evaluationId } = req.query

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    include: {
      evaluationToQuestions: true,
      students: {
        select: {
          user: true,
        },
      },
      group: true,
    },
  })

  if (!evaluation) {
    res.status(404).json({ message: 'evaluation not found' })
    return
  }

  const questions = await prisma.evaluationToQuestion.findMany({
    where: {
      evaluationId: evaluationId,
      question: {
        group: {
          scope: groupScope,
        },
      },
    },
    include: {
      question: {
        include: questionIncludeClause({
          includeTypeSpecific: true,
          includeOfficialAnswers: true,
          includeUserAnswers: {
            strategy: IncludeStrategy.ALL,
          },
          includeGradings: true,
        }),
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Transform the data to for the context of the template
  const studentsWithQuestionsAndAnswers = evaluation.students.map((student) => {
    const studentWithQuestionsAndAnswers = {
      student: student.user,
      questions: [],
    }

    questions.forEach((q) => {
      const studentAnswer = q.question.studentAnswer.find(
        (sa) => sa.user.email === student.user.email,
      )

      const evalToQuestion = evaluation.evaluationToQuestions.find(
        (etq) => etq.questionId === q.question.id,
      )

      studentWithQuestionsAndAnswers.questions.push({
        student: student.user,
        question: q.question,
        order: evalToQuestion.order + 1,
        points: evalToQuestion.points,
        studentAnswer: studentAnswer,
        studentGrading: studentAnswer?.studentGrading,
      })
    })
    return studentWithQuestionsAndAnswers
  })

  // Prepare the context for the template
  const context = {
    includeConditionsPage: !!evaluation.conditions,
    includeSectionTwo: false,
    evaluation: evaluation,
    conditions: evaluation.conditions,
    studentsWithQuestionsAndAnswers: studentsWithQuestionsAndAnswers,
    muiTheme: muiTheme,
  }

  // Compile the main template
  const template = Handlebars.compile(mainTempate)
  // Insert data into the template
  const combinedHtmlContent = template(context)

  if (OUTPUT_FORMAT === 'html') {
    res.setHeader('Content-Type', 'text/html')
    res.send(combinedHtmlContent)
    return
  } else {
    // Generate PDF
    try {
      const pdfBuffer = await generatePDF(
        combinedHtmlContent,
        evaluation.group.label,
      )
      const fileName = `evaluation_${evaluation.id}.pdf`
      // Set headers to indicate content type and disposition (attachment means it will be downloaded)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      res.send(pdfBuffer)
    } catch (error) {
      console.error(error)
      res.status(500).send('Error generating PDF')
    }
  }
}

export default withGroupScope(
  withMethodHandler({
    GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
  }),
)
