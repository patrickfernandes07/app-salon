// src/components/appointments/AppointmentDetailsModal.tsx
'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Scissors, 
  DollarSign, 
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Play,
  Square,
  UserCheck
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Appointment } from '@/services/appointment.service';
import { useAuth } from '@/contexts/auth.context';
import { safeToFixed, safeNumber } from '@/lib/utils/type-guards';

interface AppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onStatusChange: (appointmentId: number, action: string) => void;
  onDelete: (appointmentId: number) => void;
  loading: boolean;
}

export default function AppointmentDetailsModal({
  open,
  onClose,
  appointment,
  onEdit,
  onStatusChange,
  onDelete,
  loading
}: AppointmentDetailsModalProps) {
  const { user } = useAuth();

  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.SCHEDULED;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não Compareceu',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getAvailableActions = (status: string) => {
    const actions = {
      SCHEDULED: ['confirm', 'cancel'],
      CONFIRMED: ['start', 'cancel', 'no-show'],
      IN_PROGRESS: ['complete', 'cancel'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };
    return actions[status as keyof typeof actions] || [];
  };

  const getActionButton = (action: string) => {
    const buttons = {
      confirm: {
        label: 'Confirmar',
        icon: CheckCircle,
        className: 'text-green-600 hover:text-green-700'
      },
      start: {
        label: 'Iniciar',
        icon: Play,
        className: 'text-blue-600 hover:text-blue-700'
      },
      complete: {
        label: 'Finalizar',
        icon: Square,
        className: 'text-cyan-600 hover:text-cyan-700'
      },
      cancel: {
        label: 'Cancelar',
        icon: XCircle,
        className: 'text-red-600 hover:text-red-700'
      },
      'no-show': {
        label: 'Não Compareceu',
        icon: UserCheck,
        className: 'text-gray-600 hover:text-gray-700'
      },
    };
    return buttons[action as keyof typeof buttons];
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalDuration = appointment.services.reduce(
    (total, service) => total + (service.service.duration * service.quantity), 
    0
  );

  const canEdit = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);
  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes do Agendamento
            </span>
            <Badge className={`${getStatusColor(appointment.status)} border`}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Agendamento #{appointment.id} • {format(new Date(appointment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </h3>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.customer.avatar} alt={appointment.customer.name} />
                <AvatarFallback>
                  {getUserInitials(appointment.customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{appointment.customer.name}</p>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {appointment.customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.customer.phone}
                    </span>
                  )}
                  {appointment.customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {appointment.customer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Profissional */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Profissional
            </h3>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.professional.avatar} alt={appointment.professional.name} />
                <AvatarFallback>
                  {getUserInitials(appointment.professional.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{appointment.professional.name}</p>
                {appointment.professional.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.professional.specialty}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data
              </h4>
              <p className="text-lg">
                {format(new Date(appointment.startTime), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.startTime), "EEEE", { locale: ptBR })}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </h4>
              <p className="text-lg">
                {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalDuration} minutos
              </p>
            </div>
          </div>

          <Separator />

          {/* Serviços */}
          <div className="space-y-3">
            <h3 className="font-semibold">Serviços</h3>
            <div className="space-y-3">
              {appointment.services.map((appointmentService, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{appointmentService.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointmentService.service.duration} min • Quantidade: {appointmentService.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {safeToFixed(appointmentService.price)}</p>
                    {appointmentService.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        R$ {safeToFixed(safeNumber(appointmentService.price) / appointmentService.quantity)} cada
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Resumo Financeiro */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Resumo Financeiro
            </h3>
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {safeToFixed(safeNumber(appointment.totalAmount) + safeNumber(appointment.discount))}</span>
              </div>
              {safeNumber(appointment.discount) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Desconto:</span>
                  <span>- R$ {safeToFixed(appointment.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>R$ {safeToFixed(appointment.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </h3>
                <p className="text-sm p-3 bg-muted rounded-lg">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}

          {/* Ações */}
          <Separator />
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(appointment)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="outline"
                  onClick={() => onDelete(appointment.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>

            {/* Ações de Status */}
            {getAvailableActions(appointment.status).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={loading}>
                    Alterar Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações Disponíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getAvailableActions(appointment.status).map((action) => {
                    const buttonConfig = getActionButton(action);
                    const Icon = buttonConfig.icon;
                    return (
                      <DropdownMenuItem
                        key={action}
                        onClick={() => onStatusChange(appointment.id, action)}
                        className={buttonConfig.className}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {buttonConfig.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}