
import { WorkspaceItem, Employee, Colleague } from './types';

export const SAMPLE_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Sarah Jenkins', role: 'Product Designer', avatar: 'https://i.pravatar.cc/150?u=sarah', department: 'Design' },
  { id: 'e2', name: 'David Kim', role: 'Marketing Lead', avatar: 'https://i.pravatar.cc/150?u=david', department: 'Marketing' },
  { id: 'e3', name: 'Alex Morgan', role: 'Frontend Engineer', avatar: 'https://i.pravatar.cc/150?u=alex', department: 'Engineering' },
  { id: 'e4', name: 'Elena Rodriguez', role: 'HR Manager', avatar: 'https://i.pravatar.cc/150?u=elena', department: 'People' },
  { id: 'e5', name: 'Jordan Smith', role: 'Backend Engineer', avatar: 'https://i.pravatar.cc/150?u=jordan', department: 'Engineering' },
];

export const FACILITY_OPTS = [
  { id: 'Single Monitor', icon: 'desktop_windows' },
  { id: 'Dual Monitor', icon: 'monitor' },
  { id: 'Docking Station', icon: 'dock' },
  { id: 'Adjustable Height', icon: 'height' },
  { id: 'Video Conf', icon: 'videocam' },
  { id: 'Whiteboard', icon: 'draw' },
  { id: 'Wheelchair Accessible', icon: 'accessible' },
];

export const INITIAL_ITEMS: WorkspaceItem[] = [
  {
    id: 'D-101',
    type: 'desk',
    category: 'furniture',
    x: 400,
    y: 150,
    width: 120,
    height: 70,
    rotation: 0,
    label: 'D-101',
    status: 'available',
    facilities: ['Dual Monitor', 'Adjustable Height']
  },
  {
    id: 'MEET-PRO',
    type: 'meeting',
    category: 'zone',
    x: 100,
    y: 100,
    width: 250,
    height: 180,
    rotation: 0,
    label: 'Glass Room',
    status: 'available',
    facilities: ['Video Conf', 'Whiteboard', 'Wheelchair Accessible']
  },
  {
    id: 'ZONE-ENG',
    type: 'zone-box',
    category: 'zone',
    x: 350,
    y: 50,
    width: 400,
    height: 350,
    rotation: 0,
    label: 'Engineering Hub',
    status: 'available',
    color: 'rgba(14, 113, 129, 0.03)'
  }
];

export const COLLEAGUES: Colleague[] = SAMPLE_EMPLOYEES.map(e => ({ ...e, location: 'Floor 4' }));
