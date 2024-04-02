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
import { EvaluationPhase, Role, UserOnEvaluatioAccessMode } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import { IncludeStrategy, questionIncludeClause } from '@/code/questions';

const generatePDF = async (html, header) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Add a script to insert page numbers in the footer
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @page {
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          margin-right: 40px;
          font-size: 12px;
          color: #333;
        }
      }
      @page:first {
        @bottom-right { content: ""; } /* Optional: Exclude number on the first page */
      }
    `;
    document.head.appendChild(style);
  });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      bottom: '10mm', 
      left: '5mm',
      right: '5mm',
      top: '10mm',
    },
    displayHeaderFooter: true,
    footerTemplate: '<span style="width: 100%; text-align: right; font-size: 10px; color: #aaa; margin-right: 20px;"><span class="pageNumber"></span> of <span class="totalPages"></span></span>',
    headerTemplate: `<div style="font-size: 12px; color: #333; margin-left: 20px;">${header}</div>`,
  });

  await browser.close();
  return pdfBuffer;
};

const md = new Remarkable({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
});

const muiTheme = {
  "breakpoints": {
      "keys": [
          "xs",
          "sm",
          "md",
          "lg",
          "xl"
      ],
      "values": {
          "xs": 0,
          "sm": 600,
          "md": 900,
          "lg": 1200,
          "xl": 1536
      },
      "unit": "px"
  },
  "direction": "ltr",
  "components": {},
  "palette": {
      "mode": "light",
      "type": "light",
      "primary": {
          "main": "#da291c",
          "contrastText": "#ffffff",
          "dark": "#da291c",
          "light": "rgb(225, 83, 73)"
      },
      "secondary": {
          "main": "#4c36f3",
          "light": "rgb(111, 94, 245)",
          "dark": "rgb(53, 37, 170)",
          "contrastText": "#fff"
      },
      "divider": "#b5b5b5",
      "background": {
          "default": "#f3f3f3",
          "paper": "#fafafa"
      },
      "common": {
          "black": "#000",
          "white": "#fff"
      },
      "error": {
          "main": "#d32f2f",
          "light": "#ef5350",
          "dark": "#c62828",
          "contrastText": "#fff"
      },
      "warning": {
          "main": "#ed6c02",
          "light": "#ff9800",
          "dark": "#e65100",
          "contrastText": "#fff"
      },
      "info": {
          "main": "#0288d1",
          "light": "#03a9f4",
          "dark": "#01579b",
          "contrastText": "#fff"
      },
      "success": {
          "main": "#2e7d32",
          "light": "#4caf50",
          "dark": "#1b5e20",
          "contrastText": "#fff"
      },
      "grey": {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#eeeeee",
          "300": "#e0e0e0",
          "400": "#bdbdbd",
          "500": "#9e9e9e",
          "600": "#757575",
          "700": "#616161",
          "800": "#424242",
          "900": "#212121",
          "A100": "#f5f5f5",
          "A200": "#eeeeee",
          "A400": "#bdbdbd",
          "A700": "#616161"
      },
      "contrastThreshold": 3,
      "tonalOffset": 0.2,
      "text": {
          "primary": "rgba(0, 0, 0, 0.87)",
          "secondary": "rgba(0, 0, 0, 0.6)",
          "disabled": "rgba(0, 0, 0, 0.38)"
      },
      "action": {
          "active": "rgba(0, 0, 0, 0.54)",
          "hover": "rgba(0, 0, 0, 0.04)",
          "hoverOpacity": 0.04,
          "selected": "rgba(0, 0, 0, 0.08)",
          "selectedOpacity": 0.08,
          "disabled": "rgba(0, 0, 0, 0.26)",
          "disabledBackground": "rgba(0, 0, 0, 0.12)",
          "disabledOpacity": 0.38,
          "focus": "rgba(0, 0, 0, 0.12)",
          "focusOpacity": 0.12,
          "activatedOpacity": 0.12
      }
  },
  "shape": {
      "borderRadius": 4
  },
  "typography": {
      "fontSize": 12,
      "fontWeightLight": 400,
      "fontWeightRegular": 400,
      "fontWeightMedium": 500,
      "fontWeightBold": 700,
      "h1": {
          "fontSize": "2rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.167,
          "letterSpacing": "-0.01562em"
      },
      "h2": {
          "fontSize": "1.75rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.2,
          "letterSpacing": "-0.00833em"
      },
      "h3": {
          "fontSize": "1.5rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.167,
          "letterSpacing": "0em"
      },
      "h4": {
          "fontSize": "1.25rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.235,
          "letterSpacing": "0.00735em"
      },
      "h5": {
          "fontSize": "1rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.334,
          "letterSpacing": "0em"
      },
      "h6": {
          "fontSize": "0.9rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 500,
          "lineHeight": 1.6,
          "letterSpacing": "0.0075em"
      },
      "body1": {
          "fontSize": "0.9rem",
          "color": "#333333",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.5,
          "letterSpacing": "0.00938em"
      },
      "body2": {
          "fontSize": "0.85rem",
          "color": "#7e7e7e",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.43,
          "letterSpacing": "0.01071em"
      },
      "button": {
          "fontSize": "0.8rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 500,
          "lineHeight": 1.75,
          "letterSpacing": "0.02857em",
          "textTransform": "uppercase"
      },
      "caption": {
          "fontSize": "0.7rem",
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "lineHeight": 1.66,
          "letterSpacing": "0.03333em"
      },
      "htmlFontSize": 16,
      "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
      "subtitle1": {
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "fontSize": "0.8571428571428571rem",
          "lineHeight": 1.75,
          "letterSpacing": "0.00938em"
      },
      "subtitle2": {
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 500,
          "fontSize": "0.75rem",
          "lineHeight": 1.57,
          "letterSpacing": "0.00714em"
      },
      "overline": {
          "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          "fontWeight": 400,
          "fontSize": "0.6428571428571428rem",
          "lineHeight": 2.66,
          "letterSpacing": "0.08333em",
          "textTransform": "uppercase"
      },
      "inherit": {
          "fontFamily": "inherit",
          "fontWeight": "inherit",
          "fontSize": "inherit",
          "lineHeight": "inherit",
          "letterSpacing": "inherit"
      }
  },
  "unstable_sxConfig": {
      "border": {
          "themeKey": "borders"
      },
      "borderTop": {
          "themeKey": "borders"
      },
      "borderRight": {
          "themeKey": "borders"
      },
      "borderBottom": {
          "themeKey": "borders"
      },
      "borderLeft": {
          "themeKey": "borders"
      },
      "borderColor": {
          "themeKey": "palette"
      },
      "borderTopColor": {
          "themeKey": "palette"
      },
      "borderRightColor": {
          "themeKey": "palette"
      },
      "borderBottomColor": {
          "themeKey": "palette"
      },
      "borderLeftColor": {
          "themeKey": "palette"
      },
      "outline": {
          "themeKey": "borders"
      },
      "outlineColor": {
          "themeKey": "palette"
      },
      "borderRadius": {
          "themeKey": "shape.borderRadius"
      },
      "color": {
          "themeKey": "palette"
      },
      "bgcolor": {
          "themeKey": "palette",
          "cssProperty": "backgroundColor"
      },
      "backgroundColor": {
          "themeKey": "palette"
      },
      "p": {},
      "pt": {},
      "pr": {},
      "pb": {},
      "pl": {},
      "px": {},
      "py": {},
      "padding": {},
      "paddingTop": {},
      "paddingRight": {},
      "paddingBottom": {},
      "paddingLeft": {},
      "paddingX": {},
      "paddingY": {},
      "paddingInline": {},
      "paddingInlineStart": {},
      "paddingInlineEnd": {},
      "paddingBlock": {},
      "paddingBlockStart": {},
      "paddingBlockEnd": {},
      "m": {},
      "mt": {},
      "mr": {},
      "mb": {},
      "ml": {},
      "mx": {},
      "my": {},
      "margin": {},
      "marginTop": {},
      "marginRight": {},
      "marginBottom": {},
      "marginLeft": {},
      "marginX": {},
      "marginY": {},
      "marginInline": {},
      "marginInlineStart": {},
      "marginInlineEnd": {},
      "marginBlock": {},
      "marginBlockStart": {},
      "marginBlockEnd": {},
      "displayPrint": {
          "cssProperty": false
      },
      "display": {},
      "overflow": {},
      "textOverflow": {},
      "visibility": {},
      "whiteSpace": {},
      "flexBasis": {},
      "flexDirection": {},
      "flexWrap": {},
      "justifyContent": {},
      "alignItems": {},
      "alignContent": {},
      "order": {},
      "flex": {},
      "flexGrow": {},
      "flexShrink": {},
      "alignSelf": {},
      "justifyItems": {},
      "justifySelf": {},
      "gap": {},
      "rowGap": {},
      "columnGap": {},
      "gridColumn": {},
      "gridRow": {},
      "gridAutoFlow": {},
      "gridAutoColumns": {},
      "gridAutoRows": {},
      "gridTemplateColumns": {},
      "gridTemplateRows": {},
      "gridTemplateAreas": {},
      "gridArea": {},
      "position": {},
      "zIndex": {
          "themeKey": "zIndex"
      },
      "top": {},
      "right": {},
      "bottom": {},
      "left": {},
      "boxShadow": {
          "themeKey": "shadows"
      },
      "width": {},
      "maxWidth": {},
      "minWidth": {},
      "height": {},
      "maxHeight": {},
      "minHeight": {},
      "boxSizing": {},
      "fontFamily": {
          "themeKey": "typography"
      },
      "fontSize": {
          "themeKey": "typography"
      },
      "fontStyle": {
          "themeKey": "typography"
      },
      "fontWeight": {
          "themeKey": "typography"
      },
      "letterSpacing": {},
      "textTransform": {},
      "lineHeight": {},
      "textAlign": {},
      "typography": {
          "cssProperty": false,
          "themeKey": "typography"
      }
  },
  "mixins": {
      "toolbar": {
          "minHeight": 56,
          "@media (min-width:0px)": {
              "@media (orientation: landscape)": {
                  "minHeight": 48
              }
          },
          "@media (min-width:600px)": {
              "minHeight": 64
          }
      }
  },
  "shadows": [
      "none",
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
      "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
      "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
      "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
      "0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)",
      "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
      "0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)",
      "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
      "0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)",
      "0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)",
      "0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)",
      "0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)",
      "0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)",
      "0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
      "0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)",
      "0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)",
      "0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)",
      "0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)",
      "0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)",
      "0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)",
      "0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)",
      "0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)"
  ],
  "transitions": {
      "easing": {
          "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)",
          "easeOut": "cubic-bezier(0.0, 0, 0.2, 1)",
          "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
          "sharp": "cubic-bezier(0.4, 0, 0.6, 1)"
      },
      "duration": {
          "shortest": 150,
          "shorter": 200,
          "short": 250,
          "standard": 300,
          "complex": 375,
          "enteringScreen": 225,
          "leavingScreen": 195
      }
  },
  "zIndex": {
      "mobileStepper": 1000,
      "fab": 1050,
      "speedDial": 1050,
      "appBar": 1100,
      "drawer": 1200,
      "modal": 1300,
      "snackbar": 1400,
      "tooltip": 1500
  }
}


const styleTemplateString = `
<style>
  body {
    font-family: '{{muiTheme.typography.fontFamily}}';
    font-size: '{{muiTheme.typography.body1.fontSize}}px';
    color: '{{muiTheme.palette.text.primary}}';
    background-color: '{{muiTheme.palette.background.default}}';
    margin: 0;
    padding: 20px;
  }
  h1 {
    font-size: '{{muiTheme.typography.h1.fontSize}}';
    color: '{{muiTheme.palette.primary.main}}';
    font-weight: '{{muiTheme.typography.fontWeightRegular}}';
  }
  h2 {
    font-size: '{{muiTheme.typography.h2.fontSize}}';
    color: '{{muiTheme.palette.primary.main}}';
    font-weight: '{{muiTheme.typography.fontWeightRegular}}';
  }
  h3 {
    font-size: '{{muiTheme.typography.h3.fontSize}}';
    color: '{{muiTheme.palette.primary.main}}';
    font-weight: '{{muiTheme.typography.fontWeightRegular}}';
  }
  h4 {
    font-size: '{{muiTheme.typography.h4.fontSize}}';
    color: '{{muiTheme.palette.text.primary}}';
    font-weight: '{{muiTheme.typography.fontWeightRegular}}';
  }
  h5 {
    font-size: '{{muiTheme.typography.h5.fontSize}}';
    color: '{{muiTheme.palette.text.primary}}';
    font-weight: '{{muiTheme.typography.fontWeightRegular}}';
  }
  h6 {
    font-size: '{{muiTheme.typography.h6.fontSize}}';
    color: '{{muiTheme.palette.text.secondary}}';
    font-weight: '{{muiTheme.typography.fontWeightMedium}}';
  }
  p, .MuiTypography-body1 {
    font-size: '{{muiTheme.typography.body1.fontSize}}px';
    color: '{{muiTheme.palette.text.primary}}';
    line-height: 1.5;
  }
  .MuiTypography-body2 {
    font-size: '{{muiTheme.typography.body2.fontSize}}px';
    color: '{{muiTheme.palette.text.secondary}}';
    line-height: 1.43;
  }
  .MuiButton-root {
    font-size: '{{muiTheme.typography.button.fontSize}}';
    font-weight: '{{muiTheme.typography.button.fontWeight}}';
    text-transform: '{{muiTheme.typography.button.textTransform}}';
    padding: 6px 16px;
    border-radius: '{{muiTheme.shape.borderRadius}}px';
    color: '{{muiTheme.palette.primary.contrastText}}';
    background-color: '{{muiTheme.palette.primary.main}}';
    line-height: 1.75;
    display: inline-block;
    text-decoration: none;
    margin: 5px 0;
  }
  .MuiButton-root:hover {
    background-color: '{{muiTheme.palette.primary.dark}}';
  }
  a {
    color: '{{muiTheme.palette.primary.main}}';
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
</style>

`;


const studentTemplateString = `
  <!-- studentPartial.handlebars -->
  <div style="padding: 10px 0px 10px 0px; border-bottom: 1px solid {{muiTheme.palette.divider}};">
    <h3 style="margin: 0; color: {{muiTheme.palette.primary.main}}; font-family: {{muiTheme.typography.fontFamily}}; font-size: {{muiTheme.typography.h3.fontSize}}; font-weight: {{muiTheme.typography.fontWeightRegular}}; line-height: {{muiTheme.typography.h3.lineHeight}};">{{name}}</h3>
    <p style="margin: 0 0 0 0; color: {{muiTheme.palette.text.secondary}}; font-family: {{muiTheme.typography.fontFamily}}; font-size: {{muiTheme.typography.body2.fontSize}}; font-weight: {{muiTheme.typography.fontWeightRegular}}; line-height: {{muiTheme.typography.body2.lineHeight}};">{{email}}</p>
  </div>
`;


const questionHeaderTemplateString = `
  <div style="display:flex;align-items:center;width:100%;">
    <div style="flex:1;"><h3>Q{{order}} {{question.title}} </h3></div>
    <div style="margin-left: 20px;">{{studentAnswer.studentGrading?.points}} / {{points}} points</div>
  </div>
`;
    
Handlebars.registerPartial('styles', styleTemplateString);
Handlebars.registerPartial('studentInfo', studentTemplateString);
Handlebars.registerPartial('questionHeader', questionHeaderTemplateString);

const templateString = `
<html>
  <head>
    {{> styles}}
  <body>

    <div style="display:flex;justify-content:center;align-items:center;height:100%;">
      <div>
        <h2>{{evaluation.label}}</h2>
        <p>Questions: {{evaluation.evaluationToQuestions.length}}</p>
        <p>Students: {{studentsWithQuestionsAndAnswers.length}}</p>
      </div>
    </div>
    <div style="page-break-after: always;"></div>

    {{#if includeConditionsPage}}
      <h2>Conditions</h2>
      {{{conditions}}}
      <div style="page-break-after: always;"></div>
    {{/if}}

    {{#each studentsWithQuestionsAndAnswers}}
      {{#each this.questions}}
        
        {{> studentInfo this.studentAnswer.user }}
        
        {{> questionHeader this}}
        {{{this.question.content}}}
        
        <div style="page-break-after: always;"></div>
      {{/each}}
      
    {{/each}}
  </body>
</html>
`;

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
          user: true
        }
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


  /**
   * 
   * 
   studentWithQuestionsAndAnswers = {
    question,
    studentAnswer
   }
   */


  const studentsWithQuestionsAndAnswers = evaluation.students.map(student => {
    const studentWithQuestionsAndAnswers = {
      student: student.user,
      questions: [],
    };

    questions.forEach(q => {
      const studentAnswer = q.question.studentAnswer.find(sa => sa.user.email === student.user.email);

      const evalToQuestion = evaluation.evaluationToQuestions.find(etq => etq.questionId === q.question.id);

      studentWithQuestionsAndAnswers.questions.push({
        question: {
          ...q.question,
          content: md.render(q.question.content),
        },
        order: evalToQuestion.order + 1,
        points: evalToQuestion.points,
        studentAnswer: studentAnswer,
        studentGrading: studentAnswer?.studentGrading,
      });
    });

    return studentWithQuestionsAndAnswers;
  });



  console.log("studentsWithQuestionsAndAnswers", studentsWithQuestionsAndAnswers);

  // Compile the template
  const template = Handlebars.compile(templateString);
  
  const context = {
    includeConditionsPage: !!evaluation.conditions,
    includeSectionTwo: false,
    evaluation: evaluation,
    conditions: md.render(evaluation.conditions),
    studentsWithQuestionsAndAnswers: studentsWithQuestionsAndAnswers,
  };

  // Insert data into the template
  const combinedHtmlContent = template(context);
  // Generate PDF
  try {
    const pdfBuffer = await generatePDF(combinedHtmlContent, evaluation.group.label);

    // Set headers to indicate content type and disposition (attachment means it will be downloaded)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating PDF');
  }
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
})
