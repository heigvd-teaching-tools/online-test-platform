export const saveGrading = async (groupScope, grading) => {
    let newGrading = await fetch(`/api/${groupScope}/gradings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grading,
      }),
    }).then((res) => res.json())
    return newGrading
  }