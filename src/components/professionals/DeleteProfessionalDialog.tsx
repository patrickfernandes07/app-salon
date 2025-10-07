
// src/components/professionals/DeleteProfessionalDialog.tsx
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Professional } from "@/types/professional"

interface DeleteProfessionalDialogProps {
  professional: Professional | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteProfessionalDialog({
  professional,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteProfessionalDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o profissional{" "}
            <strong>{professional?.name}</strong>? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive/90 text-destructive-foreground hover:bg-destructive/70"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}