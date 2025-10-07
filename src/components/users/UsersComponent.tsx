// src/components/users/UsersComponent.tsx
"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUsers } from "@/hooks/useUsers"
import { UserForm } from "./UserForm"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { createColumns } from "./columns"
import { User, CreateUserData, UpdateUserData } from "@/types/user"

export function UsersComponent() {
  const {
    users,
    loading,
    submitting,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUsers()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const handleCreate = async (data: CreateUserData) => {
    try {
      await createUser(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleUpdate = async (data: UpdateUserData) => {
    if (!editingUser) return
    
    try {
      await updateUser(editingUser.id, data)
      setEditingUser(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser(userToDelete.id)
      setUserToDelete(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user)
    } catch (error) {
      console.error(error);
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuários..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo usuário
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingUser(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteUserDialog
        user={userToDelete}
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />
    </div>
  )
}