import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import logger from '../utils/logger';

type ErrorResponse = {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
};

export class ApiError extends Error {
    status?: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status?: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

export const handleApiError = (error: unknown): never => {
    if (error instanceof ApiError) throw error;

    const axiosError = error as AxiosError<ErrorResponse>;

    if (axiosError.response) {
        const { status, data, headers } = axiosError.response;

        // Handle rate limiting (429) responses
        if (status === 429) {
            const retryAfter = headers['x-ratelimit-retry-after'] || headers['retry-after'];
            // const limit = headers['x-ratelimit-limit']; // Unused variable
            // const remaining = headers['x-ratelimit-remaining']; // Unused variable

            let message = 'Rate limit exceeded. Please try again later.';

            if (retryAfter) {
                const retrySeconds = parseInt(retryAfter, 10);
                if (!isNaN(retrySeconds)) {
                    const minutes = Math.floor(retrySeconds / 60);
                    const seconds = retrySeconds % 60;

                    if (minutes > 0) {
                        message = `Rate limit exceeded. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` and ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}.`;
                    } else {
                        message = `Rate limit exceeded. Please try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`;
                    }
                }
            }

            toast.error(message);
            throw new ApiError(message, status, data?.errors);
        }

        const message = data?.detail || data?.message || 'An error occurred';
        toast.error(message);
        throw new ApiError(message, status, data?.errors);
    }

    if (axiosError.request) {
        toast.error('No response from server');
        throw new ApiError('No response from server');
    }

    logger.error('API Request Error:', axiosError.message);
    toast.error('An unexpected error occurred');
    throw new ApiError(axiosError.message || 'An unexpected error occurred');
};

export const withErrorHandling = async <T>(
    promise: Promise<T>,
    // defaultError = 'An error occurred' // Unused variable
): Promise<T> => {
    try {
        return await promise;
    } catch (error) {
        return handleApiError(error) as never;
    }
};