import axios from '../ajax/axiosSetup';

export async function convertCurrencyApi({ from, to, amount }: { from: string; to: string; amount: number }) {
    const response = await axios.post<{ amount: number; rate: number }>('/currency/convert', {
        from,
        to,
        amount
    });

    return response.data;
}
