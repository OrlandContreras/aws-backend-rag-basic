import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MdRefresh } from "react-icons/md";
import { FC, useState } from "react";

interface NewChatDialogProps {
  onConfirm: () => void;
  children: React.ReactNode;
}

export const NewChatDialog: FC<NewChatDialogProps> = ({ onConfirm, children }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas iniciar una nueva conversación? Esta acción eliminará completamente todo el historial actual y todas las conversaciones anteriores.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="default"
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
          >
            <MdRefresh className="h-4 w-4" />
            <span>Iniciar nueva conversación</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 