interface ToastProps {
  message: string;
}

const useToast = () => {
  return {
    toast: (toast: ToastProps) => console.log('APP:', '- toast -', toast),
  };
};

export default useToast;