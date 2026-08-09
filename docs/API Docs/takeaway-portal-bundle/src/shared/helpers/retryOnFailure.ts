const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const retryOnFailure = async <T>(callback: () => Promise<T>, maxRetries = 2, delay = 500): Promise<T> => {
    let error: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await callback();
        } catch (e) {
            error = e;

            if (attempt < maxRetries) {
                await sleep(delay * attempt);
            }
        }
    }

    throw error;
};

export default retryOnFailure;
