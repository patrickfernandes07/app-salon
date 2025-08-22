// src/services/appointment.service.ts
import apiService from "./api";

export interface Appointment {
  id: number;
  customerId: number;
  professionalId: number;
  companyId: number;
  startTime: string;
  endTime: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  totalAmount: number;
  discount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  professional: {
    id: number;
    name: string;
    avatar?: string;
    specialty?: string;
  };
  services: AppointmentServices[];
}

export interface AppointmentServices {
  id: number;
  serviceId: number;
  price: number;
  quantity: number;
  service: {
    id: number;
    name: string;
    duration: number;
    category: string;
    color?: string;
  };
}

export interface CreateAppointmentRequest {
  customerId: number;
  professionalId: number;
  companyId: number;
  startTime: string;
  endTime: string;
  services: {
    serviceId: number;
    quantity: number;
  }[];
  notes?: string;
  discount?: number;
}

export interface UpdateAppointmentRequest {
  customerId?: number;
  professionalId?: number;
  startTime?: string;
  endTime?: string;
  services?: {
    serviceId: number;
    quantity: number;
  }[];
  notes?: string;
  discount?: number;
}

export interface AppointmentSearchParams {
  startDate?: string;
  endDate?: string;
  companyId?: number;
  professionalId?: number;
  customerId?: number;
  status?: string;
}

export interface Professional {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  specialty?: string;
  isActive: boolean;
  professionalServices: {
    service: Service;
    customPrice?: number;
  }[];
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  color?: string;
  isActive: boolean;
}

export interface AvailabilityCheck {
  available: boolean;
  conflictingAppointments?: Appointment[];
}

class AppointmentService {
  // Listar agendamentos
  async getAppointments(
    params?: AppointmentSearchParams
  ): Promise<Appointment[]> {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.companyId)
      queryParams.append("companyId", params.companyId.toString());
    if (params?.professionalId)
      queryParams.append("professionalId", params.professionalId.toString());
    if (params?.customerId)
      queryParams.append("customerId", params.customerId.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await apiService.get<Appointment[]>(
      `/appointments?${queryParams.toString()}`
    );

    return response.data;
  }

  // Buscar agendamentos para calendário
  async getCalendarAppointments(
    startDate: string,
    endDate: string,
    companyId?: number
  ): Promise<Appointment[]> {
    const params: AppointmentSearchParams = {
      startDate,
      endDate,
      companyId,
    };
    return this.getAppointments(params);
  }

  // Buscar agendamento por ID
  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await apiService.get<Appointment>(`/appointments/${id}`);
    return response.data;
  }

  // Criar agendamento
  async createAppointment(
    data: CreateAppointmentRequest
  ): Promise<Appointment> {
    const response = await apiService.post<Appointment>("/appointments", data);
    return response.data;
  }

  // Atualizar agendamento
  async updateAppointment(
    id: number,
    data: UpdateAppointmentRequest
  ): Promise<Appointment> {
    console.log(data);
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}`,
      data
    );
    return response.data;
  }

  // Deletar agendamento
  async deleteAppointment(id: number): Promise<void> {
    await apiService.delete(`/appointments/${id}`);
  }

  // Confirmar agendamento
  async confirmAppointment(id: number): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}/confirm`
    );
    return response.data;
  }

  // Iniciar atendimento
  async startAppointment(id: number): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}/start`
    );
    return response.data;
  }

  // Completar atendimento
  async completeAppointment(id: number): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}/complete`
    );
    return response.data;
  }

  // Cancelar agendamento
  async cancelAppointment(id: number): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}/cancel`
    );
    return response.data;
  }

  // Marcar como não compareceu
  async markNoShow(id: number): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(
      `/appointments/${id}/no-show`
    );
    return response.data;
  }

  // Verificar disponibilidade
  async checkAvailability(
    professionalId: number,
    startTime: string,
    endTime: string
  ): Promise<AvailabilityCheck> {
    const response = await apiService.get<AvailabilityCheck>(
      `/appointments/availability/${professionalId}?startTime=${startTime}&endTime=${endTime}`
    );
    return response.data;
  }

  // Buscar profissionais
  async getProfessionals(companyId?: number): Promise<Professional[]> {
    const url = companyId
      ? `/professionals/company/${companyId}`
      : "/professionals/active";
    const response = await apiService.get<Professional[]>(url);
    return response.data;
  }

  // Buscar clientes
  async getCustomers(companyId?: number): Promise<Customer[]> {
    const url = companyId
      ? `/customers/company/${companyId}`
      : "/customers/active";
    const response = await apiService.get<Customer[]>(url);
    return response.data;
  }

  // Buscar serviços
  async getServices(companyId?: number): Promise<Service[]> {
    const url = companyId
      ? `/services/company/${companyId}`
      : "/services/active";
    const response = await apiService.get<Service[]>(url);
    return response.data;
  }

  // Buscar serviços de um profissional
  async getProfessionalServices(professionalId: number): Promise<Service[]> {
    const response = await apiService.get<
      { service: Service; customPrice?: number }[]
    >(`/professionals/${professionalId}/services`);
    return response.data.map((item) => ({
      ...item.service,
      price: item.customPrice || item.service.price,
    }));
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
