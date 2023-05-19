/*
 useSWR fetcher function.
 When a api endpoint returns an error, It outputs a json object with a message property.
 In case of errors 500 we use the default message.
 When using the useSWR we can distinguish between a generic error and a managed (specific) error using the isGeneric property.
 - in case of error 500, the isGeneric property will be true.
* */
export const fetcher = async (url) => {
  console.log('fetcher', url)
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    try {
      const data = await res.json()
      error.message = data.message
      error.isGeneric = false
    } catch (e) {
      error.isGeneric = true
    }
    error.status = res.status
    throw error
  }
  return res.json()
}

/*
this link send to student to the PageDispatch which decides (using api jam-session/id/dispatch endpoint) where the student should be directed
* */
export const getStudentEntryLink = (jamSessionId) =>
  `${window && window.location.origin}/jam-sessions/${jamSessionId}`
