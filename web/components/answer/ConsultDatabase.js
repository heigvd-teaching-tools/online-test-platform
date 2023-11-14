import React from 'react'
import QueryEditor from '@/components/question/type_specific/database/QueryEditor'
import QueryOutput from '@/components/question/type_specific/database/QueryOutput'

const ConsultDatabase = ({ queries }) => {

  return (
    queries?.map((answerToQuery, index) => (
        <React.Fragment key={`query-${answerToQuery.query.id}`}>
          <QueryEditor
              key={index}
              query={answerToQuery.query}
              readOnly
          />
          <QueryOutput
            color={"info"}
            result={answerToQuery.studentOutput?.output}
            lintResult={answerToQuery.query.lintResult}
          />
        </React.Fragment>
      ))
        
  )
}

export default ConsultDatabase
