export const register = async (data: any) => {
    // Substitua pela lógica real de registro, como uma chamada de API
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Erro ao registrar');
    }

    return response.json();
};
