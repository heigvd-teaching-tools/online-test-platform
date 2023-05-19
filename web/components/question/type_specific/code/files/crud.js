export const update = (nature, questionId, codeToFile) =>
  fetch(
    `/api/questions/${questionId}/code/files/${nature}/${codeToFile.file.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(codeToFile),
    }
  ).then((data) => data.json())

export const create = (nature, questionId, codeToFile) =>
  fetch(`/api/questions/${questionId}/code/files/${nature}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(codeToFile),
  }).then((data) => data.json())

export const del = (nature, questionId, codeToFile) =>
  fetch(
    `/api/questions/${questionId}/code/files/${nature}/${codeToFile.file.id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  ).then((data) => data.json())

export const pull = (questionId) =>
  fetch(`/api/questions/${questionId}/code/files/solution/pull`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((data) => data.json())
