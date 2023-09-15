import React from 'react'
import QueryEditor from '../question/type_specific/database/QueryEditor'
import QueryOutput from '../question/type_specific/database/QueryOutput'

const ConsultDatabase = ({ queries }) => {

  return (
    queries?.map((answerToQuery, index) => (
        <>
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
        </>
      ))
        
  )
}

export default ConsultDatabase
