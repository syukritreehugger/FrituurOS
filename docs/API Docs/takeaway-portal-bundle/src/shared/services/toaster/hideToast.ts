import { toast } from 'react-toastify';

export default (toastId: string): void => {
    toast.dismiss(toastId);
};
