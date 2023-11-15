export const update = async (groupScope, evaluationId, data) => {
  return fetch(`/api/${groupScope}/evaluations/${evaluationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const create = async (groupScope, data) => {
  return fetch(`/api/${groupScope}/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}
