import { ApiClient } from './ApiClient';

export const CHECK_TYPES = [
  'min_weight',
  'floor_wear',
  'fuel_analysis',
  'software_electronics',
  'safety_extraction',
];

export const CHECK_TYPE_LABELS: Record<string, string> = {
  min_weight: 'Peso mínimo y distribución',
  floor_wear: 'Desgaste de plancha inferior',
  fuel_analysis: 'Análisis químico y flujo de combustible',
  software_electronics: 'Inspección de software y electrónica',
  safety_extraction: 'Sistemas de seguridad y extracción',
};

export const CHECK_RESULTS = ['approved', 'failed'];

export const CHECK_RESULT_LABELS: Record<string, string> = {
  approved: 'Aprobado',
  failed: 'No aprobado',
};

export type Car = {
  id: number;
  identifier: string;
  team_id: number;
  team_name: string;
};

export type TechnicalCheck = {
  id: number;
  car_id: number;
  car_identifier: string;
  team_id: number;
  team_name: string;
  check_type: string;
  check_date: string;
  result: string;
  notes: string;
};

export type TechnicalCheckInput = {
  car_id: number;
  check_type: string;
  check_date: string;
  result: string;
  notes: string;
};

export type CarInput = { team_id: number; identifier: string };

export class TechnicalChecksService {
  constructor(private api: ApiClient) {}

  getChecks(teamId?: number) {
    return this.api.request<TechnicalCheck[]>(
      teamId ? `/technical-checks?teamId=${teamId}` : '/technical-checks',
    );
  }

  createCheck(check: TechnicalCheckInput) {
    return this.api.request('/technical-checks', 'POST', check);
  }

  updateCheck(id: number, check: TechnicalCheckInput) {
    return this.api.request(`/technical-checks/${id}`, 'PUT', check);
  }

  deleteCheck(id: number) {
    return this.api.request(`/technical-checks/${id}`, 'DELETE');
  }

  getCars() {
    return this.api.request<Car[]>('/cars');
  }

  createCar(car: CarInput) {
    return this.api.request('/cars', 'POST', car);
  }
}
