// src/components/calendar/AppointmentCalendar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ptBR } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Filter, 
  RefreshCw, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Play,
  Square
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/contexts/auth.context';
import appointmentService, { Appointment, Professional } from '@/services/appointment.service';
import { safeToFixed } from '@/lib/utils/type-guards';
import AppointmentModal from '../appointments/AppointmentModal';
import AppointmentDetailsModal from '../appointments/AppointmentDetailsModal';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    appointment: Appointment;
    status: string;
    customer: string;
    professional: string;
    services: string[];
  };
}

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    loadProfessionals();
    loadAppointments();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedProfessional, currentDate]);

  const loadProfessionals = async () => {
    try {
      const data = await appointmentService.getProfessionals(user?.companyId);
      setProfessionals(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const startDate = startOfMonth(addDays(currentDate, -30));
      const endDate = endOfMonth(addDays(currentDate, 30));

      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        companyId: user?.companyId,
        ...(selectedProfessional !== 'all' && { professionalId: selectedProfessional as number })
      };

      const data = await appointmentService.getAppointments(params);
      setAppointments(data);
    } catch (error: any) {
      setError('Erro ao carregar agendamentos');
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF' },
      CONFIRMED: { bg: '#10B981', border: '#059669', text: '#FFFFFF' },
      IN_PROGRESS: { bg: '#F59E0B', border: '#D97706', text: '#FFFFFF' },
      COMPLETED: { bg: '#06B6D4', border: '#0891B2', text: '#FFFFFF' },
      CANCELLED: { bg: '#EF4444', border: '#DC2626', text: '#FFFFFF' },
      NO_SHOW: { bg: '#6B7280', border: '#4B5563', text: '#FFFFFF' },
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

  const convertAppointmentsToEvents = useCallback((appointments: Appointment[]): CalendarEvent[] => {
    return appointments.map((appointment) => {
      const colors = getStatusColor(appointment.status);
      
      // Verificação defensiva para evitar erros
      const customerName = appointment?.customer?.name || 'Cliente não informado';
      const services = appointment?.services?.map(s => s?.service?.name || 'Serviço') || [];
      const servicesText = services.length > 0 ? services.join(', ') : 'Serviços não informados';
      
      return {
        id: appointment.id.toString(),
        title: `${customerName} - ${servicesText}`,
        start: appointment.startTime,
        end: appointment.endTime,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          appointment,
          status: appointment.status,
          customer: customerName,
          professional: appointment?.professional?.name || 'Profissional',
          services: services,
        },
      };
    });
  }, []);

  // Função para validar se o horário selecionado é válido
  const validateSelectedTime = (date: Date, time: string): { valid: boolean; message?: string } => {
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    
    if (selectedDateTime < now) {
      return { valid: false, message: 'Não é possível agendar para horários passados' };
    }
    
    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 0) { // Domingo
      return { valid: false, message: 'Agendamentos não são permitidos aos domingos' };
    }
    
    if (hours < 8 || hours >= 20) {
      return { valid: false, message: 'Horário fora do funcionamento (8h às 20h)' };
    }
    
    return { valid: true };
  };

  const handleDateSelect = (selectInfo: any) => {
    const selectedDate = selectInfo.start;
    
    // Usar o horário local diretamente sem conversões
    const timeString = selectedDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    console.log('Data selecionada:', selectedDate);
    console.log('Horário extraído:', timeString);
    
    // Validar se o horário é válido
    const validation = validateSelectedTime(selectedDate, timeString);
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    setSelectedDate(selectedDate);
    setSelectedTime(timeString);
    setSelectedAppointment(null);
    setAppointmentModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const handleCreateAppointment = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedAppointment(null);
    setAppointmentModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(false);
    setAppointmentModalOpen(true);
  };

  const handleStatusChange = async (appointmentId: number, action: string) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'confirm':
          await appointmentService.confirmAppointment(appointmentId);
          break;
        case 'start':
          await appointmentService.startAppointment(appointmentId);
          break;
        case 'complete':
          await appointmentService.completeAppointment(appointmentId);
          break;
        case 'cancel':
          await appointmentService.cancelAppointment(appointmentId);
          break;
        case 'no-show':
          await appointmentService.markNoShow(appointmentId);
          break;
      }
      
      loadAppointments();
      setDetailsModalOpen(false);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        setLoading(true);
        await appointmentService.deleteAppointment(appointmentId);
        loadAppointments();
        setDetailsModalOpen(false);
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para estilizar slots
  const getSlotClassName = (slotInfo: any) => {
    const slotDate = slotInfo.date;
    const now = new Date();
    
    // Destacar horários passados
    if (slotDate < now) {
      return 'past-slot';
    }
    
    // Destacar horário de trabalho
    const hour = slotDate.getHours();
    if (hour >= 8 && hour < 20) {
      return 'business-hour-slot';
    }
    
    return '';
  };

  const calendarEvents = convertAppointmentsToEvents(appointments);

  return (
    <>
      <style jsx global>{`
        .past-slot {
          background-color: #f3f4f6 !important;
          opacity: 0.5;
        }
        
        .business-hour-slot {
          background-color: #f0f9ff !important;
        }
        
        .fc-timegrid-slot:hover {
          background-color: #dbeafe !important;
          cursor: pointer;
        }
        
        .fc-highlight {
          background-color: #3b82f6 !important;
          opacity: 0.3;
        }
      `}</style>

      <div className="space-y-6">
        {/* Header com controles */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendário de Agendamentos
                </CardTitle>
                <CardDescription>
                  Gerencie todos os agendamentos da sua barbearia
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCreateAppointment} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
                
                <Button variant="outline" onClick={loadAppointments} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Select
                  value={selectedProfessional.toString()}
                  onValueChange={(value) => setSelectedProfessional(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os profissionais</SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id.toString()}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Legenda de status */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries({
                SCHEDULED: 'Agendado',
                CONFIRMED: 'Confirmado',
                IN_PROGRESS: 'Em Andamento',
                COMPLETED: 'Concluído',
                CANCELLED: 'Cancelado',
                NO_SHOW: 'Não Compareceu',
              }).map(([status, label]) => {
                const colors = getStatusColor(status);
                return (
                  <Badge
                    key={status}
                    variant="secondary"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card>
          <CardContent className="p-6">
            <div style={{ height: '700px' }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={calendarView}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={calendarEvents}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                eventClick={handleEventClick}
                select={handleDateSelect}
                
                // Configurações para capturar cliques em horários
                selectMinDistance={0}
                selectOverlap={false}
                
                // Callback para cliques simples em slots vazios
                dateClick={(dateClickInfo) => {
                  if (dateClickInfo.view.type !== 'dayGridMonth') {
                    const selectedDate = dateClickInfo.date;
                    
                    // Usar o horário local diretamente
                    const timeString = selectedDate.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    });
                    
                    console.log('DateClick - Data:', selectedDate);
                    console.log('DateClick - Horário:', timeString);
                    
                    const validation = validateSelectedTime(selectedDate, timeString);
                    
                    if (!validation.valid) {
                      alert(validation.message);
                      return;
                    }
                    
                    setSelectedDate(selectedDate);
                    setSelectedTime(timeString);
                    setSelectedAppointment(null);
                    setAppointmentModalOpen(true);
                  }
                }}
                
                locale="pt-br"
                timeZone="local"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                height="100%"
                expandRows={true}
                stickyHeaderDates={true}
                eventDisplay="block"
                dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
                slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false
                }}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false
                }}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6],
                  startTime: '08:00',
                  endTime: '20:00',
                }}
                aspectRatio={typeof window !== 'undefined' && window.innerWidth < 768 ? 1.0 : 1.35}
                views={{
                  timeGridWeek: {
                    dayHeaderFormat: { weekday: 'short', day: 'numeric' }
                  },
                  timeGridDay: {
                    dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'long' }
                  }
                }}
                eventContent={(eventInfo) => {
                  const { appointment } = eventInfo.event.extendedProps;
                  
                  // Verificar se os dados existem antes de usar
                  const customerName = appointment?.customer?.name || 'Cliente não informado';
                  const services = appointment?.services?.map(s => s?.service?.name || 'Serviço').join(', ') || 'Serviços não informados';
                  const professionalName = appointment?.professional?.name || 'Profissional';
                  const totalAmount = appointment?.totalAmount || 0;
                  
                  return (
                    <div className="p-1 text-xs">
                      <div className="font-semibold truncate">
                        {customerName}
                      </div>
                      <div className="truncate opacity-90">
                        {services}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="opacity-75">
                          {professionalName}
                        </span>
                        <span className="font-medium">
                          R$ {safeToFixed(totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                }}
                datesSet={(dateInfo) => {
                  setCurrentDate(dateInfo.start);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <AppointmentModal
          open={appointmentModalOpen}
          onClose={() => {
            setAppointmentModalOpen(false);
            setSelectedTime(null);
          }}
          onSuccess={loadAppointments}
          appointment={selectedAppointment}
          selectedDate={selectedDate || undefined}
          selectedTime={selectedTime || undefined}
          selectedProfessional={selectedProfessional !== 'all' ? selectedProfessional : undefined}
        />

        <AppointmentDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteAppointment}
          loading={loading}
        />
      </div>
    </>
  );
}