export interface FixedCostCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export const FIXED_COST_CATEGORIES: FixedCostCategory[] = [
  {
    id: 'premises',
    name: 'Premises',
    description: 'Costs related to your business location',
    examples: ['Rent', 'Utilities', 'Property Insurance', 'Property Taxes', 'Maintenance']
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Employee and contractor related costs',
    examples: ['Salaries', 'Benefits', 'Training', 'Recruitment', 'Payroll Services']
  },
  {
    id: 'equipment',
    name: 'Equipment',
    description: 'Tools and machinery needed to run your business',
    examples: ['Machinery', 'Computers', 'Software Licenses', 'Office Equipment', 'Maintenance']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Costs to promote and advertise your business',
    examples: ['Advertising', 'Website', 'Social Media', 'Print Materials', 'Marketing Tools']
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'External professional support',
    examples: ['Accounting', 'Legal', 'Consulting', 'Insurance', 'Banking Fees']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Vehicle and travel related expenses',
    examples: ['Vehicle Lease', 'Fuel', 'Maintenance', 'Insurance', 'Public Transport']
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    description: 'Regular subscription-based services',
    examples: ['Software', 'Professional Memberships', 'Publications', 'Cloud Services']
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other fixed costs not covered by other categories',
    examples: ['Miscellaneous', 'Contingency Fund']
  }
]; 