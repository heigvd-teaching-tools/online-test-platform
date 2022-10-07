export const update = async (sessionId, data) => {
    return fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data)
    });
}

export const create = async (data) => {
    return fetch('/api/exam-sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data)
    });
}