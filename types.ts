
export type AppMode = 'admin' | 'booking';

export interface FloorConfig {
  width: number;
  height: number;
  name: string;
}

export interface WorkspaceItem {
  id: string;
  type: 'desk' | 'l-shape' | 'meeting' | 'lounge' | 'chair' | 'storage' | 'wall' | 'zone-box' | 'divider';
  category: 'furniture' | 'zone' | 'structural';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  assignee?: Employee;
  status: 'available' | 'occupied';
  color?: string;
  zIndex?: number;
  locked?: boolean;
  facilities?: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
}

export interface Colleague extends Employee {
  location: string;
}
