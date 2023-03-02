
export const updateFile = (which, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${which}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());

export const addFile = (which, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${which}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());

export const deleteFile = (which, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${which}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());
