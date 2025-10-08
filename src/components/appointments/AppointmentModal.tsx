// src/components/appointments/AppointmentModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      services: [],
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

  const loadInitialData = useCallback(async (): Promise<void> => {
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
  }, [user?.companyId]);

  const calculateTotals = useCallback((): void => {
    // Pegar valores atuais diretamente do formulário
    const currentServices = getValues('services');
    const currentDiscount = getValues('discount') || 0;
    
    let amount = 0;
    let duration = 0;

    console.log('🔄 Calculando totais...', {
      currentServices,
      professionalServices: professionalServices.map(s => ({ id: s.id, name: s.name, price: s.price }))
    });

    currentServices.forEach(item => {
      const service = professionalServices.find(s => s.id === item.serviceId);
      
      if (service && item.serviceId > 0 && item.quantity > 0) {
        const servicePrice = Number(service.price);
        const itemTotal = servicePrice * item.quantity;
        
        console.log(`✅ ${service.name}: R$ ${servicePrice} x ${item.quantity} = R$ ${itemTotal}`);
        
        amount += itemTotal;
        duration += (service.duration || 30) * item.quantity;
      } else {
        console.log(`❌ Serviço não encontrado ou inválido:`, { serviceId: item.serviceId, quantity: item.quantity });
      }
    });

    console.log(`💰 Subtotal: R$ ${amount} | Desconto: ${currentDiscount}% | Duração: ${duration}min`);

    setSubtotal(amount);
    
    const discountAmount = amount * (currentDiscount / 100);
    const finalAmount = Math.max(0, amount - discountAmount);
    
    setTotalAmount(finalAmount);
    setTotalDuration(duration);
  }, [professionalServices, getValues]);

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, loadInitialData]);

  // Preencher dados para edição ou valores selecionados (ANTES de carregar serviços)
  useEffect(() => {
    if (open && appointment) {
      setValue('customerId', appointment.customerId);
      setValue('professionalId', appointment.professionalId);
      setValue('date', new Date(appointment.startTime));
      setValue('startTime', format(new Date(appointment.startTime), 'HH:mm'));
      setValue('notes', appointment.notes || '');
      setValue('discount', appointment.discount || 0);
      
      // Carregar serviços do profissional primeiro, depois preencher os serviços
      loadProfessionalServices(appointment.professionalId).then(() => {
        setValue('services', appointment.services.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity
        })));
      });
    } else if (open && !appointment) {
      if (selectedDate) setValue('date', selectedDate);
      if (selectedTime) setValue('startTime', selectedTime);
      if (selectedProfessional) setValue('professionalId', selectedProfessional);
    }
  }, [open, appointment, selectedDate, selectedTime, selectedProfessional, setValue]);

  // Carregar serviços do profissional quando selecionado (APENAS para novos agendamentos)
  useEffect(() => {
    if (watchedProfessional && !appointment) {
      loadProfessionalServices(watchedProfessional);
      setValue('services', []);
    }
  }, [watchedProfessional, appointment, setValue]);

  // Calcular total e duração quando serviços, desconto ou lista de serviços do profissional mudarem
  useEffect(() => {
    if (professionalServices.length > 0) {
      calculateTotals();
    }
  }, [watchedServices, watchedDiscount, professionalServices, calculateTotals]);

  // Adicionar primeiro serviço automaticamente (APENAS para novos agendamentos)
  useEffect(() => {
    if (professionalServices.length > 0 && !appointment && fields.length === 0) {
      append({ serviceId: professionalServices[0].id, quantity: 1 });
    }
  }, [professionalServices, appointment, fields.length, append]);

  const loadProfessionalServices = async (professionalId: number): Promise<void> => {
    try {
      const data = await appointmentService.getProfessionalServices(professionalId);
      setProfessionalServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços do profissional:', error);
    }
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
        const updateData = {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          services: data.services,
          notes: data.notes,
          discount: data.discount || 0,
        };
        await appointmentService.updateAppointment(appointment.id, updateData as UpdateAppointmentRequest);
      } else {
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
    } catch (error: unknown) {
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
    setSubtotal(0);
    setTotalAmount(0);
    setTotalDuration(0);
    onClose();
  };

  const addService = (): void => {
    if (watchedProfessional && professionalServices.length > 0) {
      append({ serviceId: professionalServices[0].id, quantity: 1 });
    } else {
      setError('Selecione um profissional primeiro');
    }
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

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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
                            <span className="truncate">{customer.name}</span>
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
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data *</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {field.value ? format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
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
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Horário *
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
                            <SelectItem key={time} value={time} disabled={isPast}>
                              {time} {isPast && <span className="text-xs">(passado)</span>}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
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
                <div key={field.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm">Serviço</Label>
                      <Controller
                        name={`services.${index}.serviceId`}
                        control={control}
                        render={({ field: serviceField }) => (
                          <Select
                            value={serviceField.value?.toString()}
                            onValueChange={(value) => {
                              serviceField.onChange(parseInt(value));
                              // Forçar recálculo após a mudança
                              requestAnimationFrame(() => calculateTotals());
                            }}
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
                                      R$ {Number(service.price).toFixed(2)} • {service.duration || 30}min
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        className="w-full"
                        {...register(`services.${index}.quantity`, { 
                          valueAsNumber: true,
                          onChange: () => {
                            requestAnimationFrame(() => calculateTotals());
                          }
                        })}
                      />
                    </div>

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
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.services && <p className="text-xs text-destructive">{errors.services.message}</p>}
          </div>

          <Separator />

          {/* Observações e Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {...register('discount', { 
                    valueAsNumber: true,
                    onChange: () => {
                      requestAnimationFrame(() => calculateTotals());
                    }
                  })}
                />
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Resumo do Agendamento</Label>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                {watchedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Desconto ({watchedDiscount}%):</span>
                    <span>- R$ {(subtotal * (watchedDiscount / 100)).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg">R$ {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duração:</span>
                  <span>{totalDuration} minutos</span>
                </div>
              </div>
            </div>
          </div>

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