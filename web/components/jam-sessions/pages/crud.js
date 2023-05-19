export const update = async (jamSessionId, data) => {
  return fetch(`/api/jam-sessions/${jamSessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const create = async (data) => {
  return fetch('/api/jam-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}
