// TODO: test
export default (total: number, currency?: string) => {
    let result = total.toLocaleString('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });

    if (currency) {
        result = `${currency} ${result}`;
    }

    return result;
};
