import ResizePanel from "@/components/layout/utils/ResizePanel"
import FileEditor from "@/components/question/type_specific/code/FileEditor"

const { useAnnotation } = require("@/context/AnnotationContext")

const StudentFileAnnotationWrapper = ({ file:original }) => {
    const { readOnly, showOriginal, annotation, change } = useAnnotation()
  
    const onChange = ({content}) => {
      change(content)
    }
  
    const hasAnnotation = annotation?.content !== undefined
  
    const file = {
      ...original,
      content: hasAnnotation ? annotation.content : original.content,
    }
  
    return (
      <ResizePanel
        leftPanel={
          <FileEditor 
            file={file}
            readonlyPath
            readonlyContent={readOnly}
            onChange={onChange}
          />
        }
        rightPanel={
          <FileEditor 
            file={{
              path: `[Original] ${file.path}`,
              content: original.content,
            }}
            readonlyPath
            readonlyContent
          />
        }
        rightWidth={hasAnnotation && showOriginal ? 40 : 0}
        hideHandle={!hasAnnotation || !showOriginal}
      />
    )
  }

export default StudentFileAnnotationWrapper