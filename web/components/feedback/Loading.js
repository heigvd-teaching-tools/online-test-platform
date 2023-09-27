import LoadingAnimation from './LoadingAnimation'
const Loading = ({ children, errors = [], loading = true, message = "", }) => {
  // find first error that is not undefined or null
  const error = errors.find((error) => error !== undefined && error !== null)
  if (error)
    return <LoadingAnimation failed={error.isGeneric} content={error.message} />
  if (loading) return <LoadingAnimation content={message} />

  return children
}
export default Loading
