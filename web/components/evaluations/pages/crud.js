export const update = async (groupScope, evaluationId, data) => {
  return fetch(`/api/${groupScope}/evaluation/${evaluationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const create = async (groupScope, data) => {
  return fetch(`/api/${groupScope}/evaluation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}
