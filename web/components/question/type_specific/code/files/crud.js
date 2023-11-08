export const update = (nature, groupScope, questionId, codeToFile) =>
  fetch(
    `/api/${groupScope}/questions/${questionId}/code/files/${nature}/${codeToFile.file.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(codeToFile),
    }
  ).then((data) => data.json())

export const create = (nature, groupScope, questionId, codeToFile) =>
  fetch(`/api/${groupScope}/questions/${questionId}/code/files/${nature}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(codeToFile),
  }).then((data) => data.json())

export const del = (nature, groupScope, questionId, codeToFile) =>
  fetch(
    `/api/${groupScope}/questions/${questionId}/code/files/${nature}/${codeToFile.file.id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  ).then((data) => data.json())

export const pull = (groupScope, questionId) =>
  fetch(`/api/${groupScope}/questions/${questionId}/code/files/solution/pull`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((data) => data.json())
