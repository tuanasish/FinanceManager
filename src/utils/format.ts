export const formatCurrency = (amount: number, currency = 'VND') => {
    if (currency === 'VND') {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    }
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseCurrencyToInt = (amountStr: string) => {
    return parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
};
