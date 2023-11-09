export const update = async (groupScope, jamSessionId, data) => {
  return fetch(`/api/${groupScope}/jam-sessions/${jamSessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const create = async (groupScope, data) => {
  return fetch(`/api/${groupScope}/jam-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}
