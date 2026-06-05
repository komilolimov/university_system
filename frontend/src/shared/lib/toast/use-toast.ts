import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, description?: string) => 
    sonnerToast.success(message, { description }),
    
  error: (message: string, description?: string) => 
    sonnerToast.error(message, { description }),
    
  info: (message: string, description?: string) => 
    sonnerToast.info(message, { description }),
    
  loading: (message: string, description?: string) => 
    sonnerToast.loading(message, { description }),
    
  dismiss: (id?: string | number) => 
    sonnerToast.dismiss(id),
    
  confirm: (title: string, description: string, onConfirm: () => void) => 
    sonnerToast(title, {
      description,
      action: {
        label: "Confirm",
        onClick: onConfirm,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    }),
};