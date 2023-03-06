
export const updateFile = (nature, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${nature}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());

export const addFile = (nature, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${nature}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());

export const deleteFile = (nature, questionId, file) =>
    fetch(`/api/questions/${questionId}/code/files/${nature}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(file)
    }).then(data => data.json());
