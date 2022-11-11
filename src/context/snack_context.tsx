import React, {
    createContext,
    ReactElement,
    useContext,
    useState,
  } from 'react';
  import { Alert, Snackbar } from '@mui/material';
  
  export type SnackType = 'success' | 'info' | 'warning' | 'error';
  
  export interface SnackInfo {
    alert(value: string, duration?: number): void;
    info(value: string, duration?: number): void;
    success(value: string, duration?: number): void;
    error(value: string, duration?: number): void;
    connectionFail(): void;
  }
  
  const SnackInfoDefault: SnackInfo = {
    alert: (value: string) => {},
    info: (value: string) => {},
    success: (value: string) => {},
    error: (value: string) => {},
    connectionFail: () => {},
  };
  
  interface Props {
    children: React.ReactNode;
  }
  
  const SnackContext = createContext<SnackInfo>(SnackInfoDefault);
  
  export function useSnack() {
    return useContext(SnackContext);
  }
  
  export function SnackProvider(props: Props): ReactElement {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackType>('info');
    const [duration, setDuration] = useState(6000);
  
    function alert(value: string, duration?: number) {
      setMessage(value);
      setType('warning');
      duration && setDuration(duration);
      setOpen(true);
    }
  
    function success(value: string, duration?: number) {
      setMessage(value);
      setType('success');
      duration && setDuration(duration);
      setOpen(true);
    }
  
    function info(value: string, duration?: number) {
      setMessage(value);
      setType('info');
      duration && setDuration(duration);
      setOpen(true);
    }
  
    function error(value: string, duration?: number) {
      setMessage(value);
      setType('error');
      duration && setDuration(duration);
      setOpen(true);
    }
  
    function connectionFail() {
      setMessage(
        'Falha na comunicação. Verifique sua conexão e tente novamente.',
      );
      setType('error');
      duration && setDuration(duration);
      setOpen(true);
    }
  
    return (
      <SnackContext.Provider
        value={{ alert, success, info, error, connectionFail }}
      >
        {props.children}
        <Snackbar
          open={open}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={duration}
          onClose={() => setOpen(false)}
        >
          <Alert variant="filled" severity={type}>
            {message}
          </Alert>
        </Snackbar>
      </SnackContext.Provider>
    );
  }
  
  export default SnackContext;