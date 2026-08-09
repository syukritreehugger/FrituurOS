export default function batchExecutor<T>(callback: (batch: T[]) => void, timeout = window.Cypress ? 0 : 5000) {
    let batch: T[] = [];
    let timeoutId: NodeJS.Timeout | null = null;

    return function addToBatch(arg: T) {
        batch.push(arg);

        if (timeoutId !== null) {
            return;
        }

        timeoutId = setTimeout(() => {
            const batchCopy = batch;
            batch = [];
            timeoutId = null;
            callback(batchCopy);
        }, timeout);
    };
}
