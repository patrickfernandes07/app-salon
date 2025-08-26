// src/components/appointments/AppointmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, User, Clock, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuth } from '@/contexts/auth.context';
import appointmentService, { 
  Appointment, 
  Professional, 
  Customer, 
  Service,
  CreateAppointmentRequest,
  UpdateAppointmentRequest 
} from '@/services/appointment.service';
import { safeToFixed, safeNumber } from '@/lib/utils/type-guards';

const appointmentSchema = z.object({
  customerId: z.number().min(1, 'Cliente é obrigatório'),
  professionalId: z.number().min(1, 'Profissional é obrigatório'),
  date: z.date().refine(val => val !== undefined, {
    message: 'Data é obrigatória'
  }),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  services: z.array(z.object({
    serviceId: z.number().min(1, 'Serviço é obrigatório'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  })).min(1, 'Pelo menos um serviço é obrigatório'),
  notes: z.string().optional(),
  discount: z.number().min(0, 'Desconto não pode ser negativo').optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
  selectedProfessional?: number;
}

export default function AppointmentModal({
  open,
  onClose,
  onSuccess,
  appointment,
  selectedDate,
  selectedTime,
  selectedProfessional
}: AppointmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [professionalServices, setProfessionalServices] = useState<Service[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      services: [{ serviceId: 0, quantity: 1 }],
      discount: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services'
  });

  const watchedProfessional = watch('professionalId');
  const watchedServices = watch('services');
  const watchedDiscount = watch('discount') || 0;

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Carregar serviços do profissional quando selecionado
  useEffect(() => {
    if (watchedProfessional) {
      loadProfessionalServices(watchedProfessional);
    }
  }, [watchedProfessional]);

  // Calcular total e duração
  useEffect(() => {
    calculateTotals();
  }, [watchedServices, watchedDiscount, professionalServices]);

  // Preencher dados para edição ou valores selecionados
  useEffect(() => {
    if (appointment) {
      setValue('customerId', appointment.customerId);
      setValue('professionalId', appointment.professionalId);
      setValue('date', new Date(appointment.startTime));
      setValue('startTime', format(new Date(appointment.startTime), 'HH:mm'));
      setValue('services', appointment.services.map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity
      })));
      setValue('notes', appointment.notes || '');
      setValue('discount', appointment.discount || 0);
    } else {
      // Para novos agendamentos, preencha com valores selecionados
      if (selectedDate) setValue('date', selectedDate);
      if (selectedTime) setValue('startTime', selectedTime);
      if (selectedProfessional) setValue('professionalId', selectedProfessional);
    }
  }, [appointment, selectedDate, selectedTime, selectedProfessional, setValue]);

  const loadInitialData = async (): Promise<void> => {
    try {
      const [professionalsData, customersData] = await Promise.all([
        appointmentService.getProfessionals(user?.companyId),
        appointmentService.getCustomers(user?.companyId)
      ]);

      setProfessionals(professionalsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados iniciais');
    }
  };

  const loadProfessionalServices = async (professionalId: number): Promise<void> => {
    try {
      const data = await appointmentService.getProfessionalServices(professionalId);
      setProfessionalServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços do profissional:', error);
    }
  };

  const calculateTotals = (): void => {
    let amount = 0;
    let duration = 0;

    watchedServices.forEach(item => {
      const service = professionalServices.find(s => s.id === item.serviceId);
      if (service && item.quantity > 0) {
        amount += safeNumber(service.price) * item.quantity;
        duration += (service.duration || 30) * item.quantity;
      }
    });

    const discountAmount = amount * (watchedDiscount / 100);
    const finalAmount = Math.max(0, amount - discountAmount);
    
    setTotalAmount(finalAmount);
    setTotalDuration(duration);
  };

  const generateTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = addMinutes(startDate, duration);
    return format(endDate, 'HH:mm');
  };

  // Função para validar se o horário é no passado
  const isTimeInPast = (date: Date, time: string): boolean => {
    const now = new Date();
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    return selectedDateTime < now;
  };

  const onSubmit = async (data: AppointmentFormData): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const startDateTime = new Date(data.date);
      const [hours, minutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = addMinutes(startDateTime, totalDuration || 60);

      // Verificar disponibilidade apenas se não for edição ou se mudou o horário/profissional
      const needsAvailabilityCheck = !appointment || 
        appointment.startTime !== startDateTime.toISOString() ||
        appointment.professionalId !== data.professionalId;

      if (needsAvailabilityCheck) {
        const availability = await appointmentService.checkAvailability(
          data.professionalId,
          startDateTime.toISOString(),
          endDateTime.toISOString()
        );

        if (!availability.available) {
          setError('Horário não disponível. Há conflito com outros agendamentos.');
          return;
        }
      }

      if (appointment) {
        // Payload para UPDATE - apenas campos aceitos pelo UpdateAppointmentDto
        const updateData = {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          services: data.services,
          notes: data.notes,
          discount: data.discount || 0,
        };

        await appointmentService.updateAppointment(appointment.id, updateData as UpdateAppointmentRequest);
      } else {
        // Payload para CREATE - todos os campos necessários
        const createData = {
          customerId: data.customerId,
          professionalId: data.professionalId,
          companyId: user?.companyId || 1,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          services: data.services,
          notes: data.notes,
          discount: data.discount || 0,
        };

        await appointmentService.createAppointment(createData as CreateAppointmentRequest);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      // Tipagem mais específica para o erro
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao salvar agendamento';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    reset();
    setError('');
    setProfessionalServices([]);
    setTotalAmount(0);
    setTotalDuration(0);
    onClose();
  };

  const addService = (): void => {
    append({ serviceId: 0, quantity: 1 });
  };

  const removeService = (index: number): void => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarIcon className="h-5 w-5 shrink-0" />
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {appointment ? 'Edite as informações do agendamento' : 'Preencha as informações para criar um novo agendamento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações Básicas */}
          <div className="space-y-4">
            {/* Cliente e Profissional - Stack em mobile, side-by-side em desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="customerId" className="text-sm font-medium">
                  <User className="h-4 w-4 inline mr-2" />
                  Cliente *
                </Label>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate">{customer.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.customerId && (
                  <p className="text-xs text-destructive">{errors.customerId.message}</p>
                )}
              </div>

              {/* Profissional */}
              <div className="space-y-2">
                <Label htmlFor="professionalId" className="text-sm font-medium">Profissional *</Label>
                <Controller
                  name="professionalId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id.toString()}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate">{professional.name}</span>
                              {professional.specialty && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {professional.specialty}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professionalId && (
                  <p className="text-xs text-destructive">{errors.professionalId.message}</p>
                )}
              </div>
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Data */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data *</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            ) : (
                              "Selecione uma data"
                            )}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Horário *
                  {selectedTime && !appointment && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Horário selecionado: {selectedTime})
                    </span>
                  )}
                </Label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((time) => {
                          const isPast = watch('date') && isTimeInPast(watch('date'), time);
                          return (
                            <SelectItem 
                              key={time} 
                              value={time}
                              disabled={isPast}
                              className={isPast ? 'opacity-50' : ''}
                            >
                              {time}
                              {isPast && <span className="text-xs ml-2">(passado)</span>}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.startTime && (
                  <p className="text-xs text-destructive">{errors.startTime.message}</p>
                )}
                {watch('startTime') && totalDuration > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Término previsto: {calculateEndTime(watch('startTime'), totalDuration)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Serviços */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Label className="text-base font-medium">Serviços *</Label>
              <Button type="button" onClick={addService} size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  {/* Grid responsivo para serviços */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Serviço */}
                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                      <Label className="text-sm">Serviço</Label>
                      <Controller
                        name={`services.${index}.serviceId`}
                        control={control}
                        render={({ field: serviceField }) => (
                          <Select
                            value={serviceField.value?.toString()}
                            onValueChange={(value) => serviceField.onChange(parseInt(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o serviço" />
                            </SelectTrigger>
                            <SelectContent>
                              {professionalServices.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  <div className="flex flex-col items-start min-w-0">
                                    <span className="truncate font-medium">{service.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      R$ {safeToFixed(service.price)} • {service.duration || 30}min
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Quantidade */}
                    <div className="space-y-2">
                      <Label className="text-sm">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        className="w-full"
                        {...register(`services.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Botão remover */}
                    <div className="flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeService(index)}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Remover</span>
                          <span className="sm:hidden">Remover</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.services && (
              <p className="text-xs text-destructive">{errors.services.message}</p>
            )}
          </div>

          <Separator />

          {/* Observações e Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Observações */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
                <Textarea
                  {...register('notes')}
                  placeholder="Observações sobre o agendamento..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-medium">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Desconto (%) - Opcional
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  className="w-full"
                  {...register('discount', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Resumo do Agendamento</Label>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">R$ {safeToFixed(totalAmount + (totalAmount * (watchedDiscount / 100)))}</span>
                </div>
                {watchedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Desconto ({watchedDiscount}%):</span>
                    <span>- R$ {safeToFixed((totalAmount + (totalAmount * (watchedDiscount / 100))) * (watchedDiscount / 100))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg">R$ {safeToFixed(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duração:</span>
                  <span>{totalDuration} minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                appointment ? 'Atualizar' : 'Criar Agendamento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}