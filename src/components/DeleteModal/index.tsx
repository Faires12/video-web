import React from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface Props{
    open: boolean
    close(): void
    okClick(): void
    title: string
    description: string
}

export const DeleteModal = ({open, close, okClick, title, description}: Props) => {
  return (
    <Dialog
        open={open}
        onClose={close}
      >
        <Box sx={{width: '300px'}}> 
        <DialogTitle sx={{textAlign: 'center'}}>
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={close}>Cancelar</Button>
          <Button onClick={() => {
            okClick()
            close()
          }}>
            deletar
          </Button>
        </DialogActions>
        </Box>
      </Dialog>
  )
}
