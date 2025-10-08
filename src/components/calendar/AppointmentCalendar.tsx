// src/components/calendar/AppointmentCalendar.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { 
  DateSelectArg, 
  EventClickArg, 
  EventContentArg,
  DatesSetArg 
} from '@fullcalendar/core';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth.context';
import appointmentService, { Appointment, Professional } from '@/services/appointment.service';
import { formatCurrency } from '@/lib/utils/currency';
import AppointmentModal from '../appointments/AppointmentModal';
import AppointmentDetailsModal from '../appointments/AppointmentDetailsModal';


// Interfaces auxiliares para tipagem
interface ServiceInfo {
  service: {
    name: string;
  };
}

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

type StatusType = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

interface StatusColors {
  bg: string;
  border: string;
  text: string;
}

interface AppointmentParams {
  startDate: string;
  endDate: string;
  companyId?: number;
  professionalId?: number;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

// Configurações constantes fora do componente
const CALENDAR_PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin];
const CALENDAR_LOCALES = [ptBrLocale];

const STATUS_COLORS: Record<StatusType, StatusColors> = {
  SCHEDULED: { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF' },
  CONFIRMED: { bg: '#10B981', border: '#059669', text: '#FFFFFF' },
  IN_PROGRESS: { bg: '#F59E0B', border: '#D97706', text: '#FFFFFF' },
  COMPLETED: { bg: '#06B6D4', border: '#0891B2', text: '#FFFFFF' },
  CANCELLED: { bg: '#EF4444', border: '#DC2626', text: '#FFFFFF' },
  NO_SHOW: { bg: '#6B7280', border: '#4B5563', text: '#FFFFFF' },
};

const BUSINESS_HOURS = {
  daysOfWeek: [1, 2, 3, 4, 5, 6],
  startTime: '08:00',
  endTime: '20:00',
};

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
  const [calendarView, setCalendarView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
    }
    return 'timeGridWeek';
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarRef = useRef<any>(null);

  // Ajustar visualização baseado no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const newView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
      setCalendarView(newView);
      
      // Forçar o FullCalendar a atualizar a view
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(newView);
      }
    };

    // Adicionar listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modals
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getStatusColor = useCallback((status: string): StatusColors => {
    return STATUS_COLORS[status as StatusType] || STATUS_COLORS.SCHEDULED;
  }, []);

  // Carregar profissionais apenas uma vez
  useEffect(() => {
    let isMounted = true;

    const loadProfessionals = async () => {
      if (!user?.companyId) return;
      
      try {
        const data = await appointmentService.getProfessionals(user.companyId);
        if (isMounted) {
          setProfessionals(data);
        }
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
      }
    };

    loadProfessionals();

    return () => {
      isMounted = false;
    };
  }, [user?.companyId]);

  // Carregar agendamentos
  const loadAppointments = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      setError('');

      const startDate = startOfMonth(addDays(currentDate, -30));
      const endDate = endOfMonth(addDays(currentDate, 30));

      const params: AppointmentParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        companyId: user.companyId,
      };

      const data = await appointmentService.getAppointments(params);
      
      setAppointments(data);
    } catch (error) {
      setError('Erro ao carregar agendamentos');
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, currentDate]);

  // Carregar agendamentos quando necessário
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Converter appointments para eventos - MEMOIZADO
  const calendarEvents = useMemo(() => {
    const filteredAppointments = selectedProfessional === 'all' 
      ? appointments 
      : appointments.filter(apt => apt.professionalId === selectedProfessional);
    
    return filteredAppointments.map((appointment) => {
      const colors = getStatusColor(appointment.status);
      
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
  }, [appointments, selectedProfessional, getStatusColor]);

  // Função para validar se o horário selecionado é válido
  const validateSelectedTime = useCallback((date: Date, time: string): ValidationResult => {
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    
    if (selectedDateTime < now) {
      return { valid: false, message: 'Não é possível agendar para horários passados' };
    }
    
    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 0) {
      return { valid: false, message: 'Agendamentos não são permitidos aos domingos' };
    }
    
    if (hours < 8 || hours >= 20) {
      return { valid: false, message: 'Horário fora do funcionamento (8h às 20h)' };
    }
    
    return { valid: true };
  }, []);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg): void => {
    const selectedDate = selectInfo.start;
    
    const timeString = selectedDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const validation = validateSelectedTime(selectedDate, timeString);
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    setSelectedDate(selectedDate);
    setSelectedTime(timeString);
    setSelectedAppointment(null);
    setAppointmentModalOpen(true);
  }, [validateSelectedTime]);

  const handleEventClick = useCallback((clickInfo: EventClickArg): void => {
    const appointment = clickInfo.event.extendedProps.appointment as Appointment;
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  }, []);

  const handleCreateAppointment = useCallback((): void => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedAppointment(null);
    setAppointmentModalOpen(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment): void => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(false);
    setAppointmentModalOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (appointmentId: number, action: string): Promise<void> => {
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
      
      await loadAppointments();
      setDetailsModalOpen(false);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  }, [loadAppointments]);

  const handleDeleteAppointment = useCallback(async (appointmentId: number): Promise<void> => {
    try {
      setLoading(true);
      
      await appointmentService.deleteAppointment(appointmentId);
      
      await loadAppointments();
      
    } catch (error) {
      console.error('❌ Erro ao excluir agendamento:', error);
      setError('Erro ao excluir agendamento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadAppointments]);

  const handleDateClick = useCallback((dateClickInfo: { date: Date; view: { type: string } }): void => {
    if (dateClickInfo.view.type !== 'dayGridMonth') {
      const selectedDate = dateClickInfo.date;
      
      const timeString = selectedDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
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
  }, [validateSelectedTime]);

  const handleDatesSet = useCallback((dateInfo: DatesSetArg): void => {
    setCurrentDate(dateInfo.start);
  }, []);

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { appointment } = eventInfo.event.extendedProps;
    
    const customerName = appointment?.customer?.name || 'Cliente não informado';
    
    const services = (appointment?.services as ServiceInfo[] || [])
      .map(s => s?.service?.name || 'Serviço')
      .join(', ') || 'Serviços não informados';
    
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
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    );
  }, []);

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
              {(Object.entries({
                SCHEDULED: 'Agendado',
                CONFIRMED: 'Confirmado',
                IN_PROGRESS: 'Em Andamento',
                COMPLETED: 'Concluído',
                CANCELLED: 'Cancelado',
                NO_SHOW: 'Não Compareceu',
              }) as [StatusType, string][]).map(([status, label]) => {
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
                plugins={CALENDAR_PLUGINS}
                initialView={calendarView}
                locales={CALENDAR_LOCALES}
                locale='pt-br'
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
                selectMinDistance={0}
                selectOverlap={false}
                dateClick={handleDateClick}
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
                businessHours={BUSINESS_HOURS}
                aspectRatio={typeof window !== 'undefined' && window.innerWidth < 768 ? 1.0 : 1.35}
                views={{
                  timeGridWeek: {
                    dayHeaderFormat: { weekday: 'short', day: 'numeric' }
                  },
                  timeGridDay: {
                    dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'long' }
                  }
                }}
                eventContent={renderEventContent}
                datesSet={handleDatesSet}
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