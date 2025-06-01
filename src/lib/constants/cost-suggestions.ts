export interface CostSuggestion {
  id: string;
  name: string;
  categoryId: string;
}

export const COST_SUGGESTIONS: CostSuggestion[] = [
  // Premises
  { id: 'rent', name: 'Office/Workspace Rent', categoryId: 'premises' },
  { id: 'utilities', name: 'Utilities (Electricity, Water, Gas)', categoryId: 'premises' },
  { id: 'internet', name: 'Business Internet & Phone Lines', categoryId: 'premises' },
  { id: 'security', name: 'Security System & Monitoring', categoryId: 'premises' },
  { id: 'cleaning', name: 'Cleaning & Maintenance Services', categoryId: 'premises' },
  
  // Staff
  { id: 'salaries', name: 'Employee Salaries', categoryId: 'staff' },
  { id: 'benefits', name: 'Employee Benefits & Insurance', categoryId: 'staff' },
  { id: 'training', name: 'Staff Training & Development', categoryId: 'staff' },
  { id: 'recruitment', name: 'Recruitment & HR Services', categoryId: 'staff' },
  { id: 'payroll', name: 'Payroll Processing Services', categoryId: 'staff' },
  
  // Equipment
  { id: 'computers', name: 'Computers & IT Equipment', categoryId: 'equipment' },
  { id: 'furniture', name: 'Office Furniture & Fixtures', categoryId: 'equipment' },
  { id: 'maintenance', name: 'Equipment Maintenance & Support', categoryId: 'equipment' },
  
  // Marketing
  { id: 'digital', name: 'Digital Marketing & Advertising', categoryId: 'marketing' },
  { id: 'website', name: 'Website Hosting & Maintenance', categoryId: 'marketing' },
  { id: 'content', name: 'Content Creation & Marketing', categoryId: 'marketing' },
  { id: 'branding', name: 'Branding & Design Services', categoryId: 'marketing' },
  
  // Professional Services
  { id: 'accounting', name: 'Accounting & Bookkeeping', categoryId: 'professional' },
  { id: 'legal', name: 'Legal Services & Compliance', categoryId: 'professional' },
  { id: 'insurance', name: 'Business Insurance Policies', categoryId: 'professional' },
  { id: 'tax', name: 'Tax Preparation & Planning', categoryId: 'professional' },
  
  // Transportation
  { id: 'vehicle', name: 'Company Vehicle Lease/Purchase', categoryId: 'transportation' },
  { id: 'fuel', name: 'Fuel & Vehicle Maintenance', categoryId: 'transportation' },
  { id: 'delivery', name: 'Delivery & Shipping Services', categoryId: 'transportation' },
  { id: 'travel', name: 'Business Travel Expenses', categoryId: 'transportation' },
  { id: 'parking', name: 'Parking & Transportation Fees', categoryId: 'transportation' },
  
  // Subscriptions
  { id: 'ecommerce', name: 'Ecommerce System', categoryId: 'subscriptions' },
  { id: 'accounting', name: 'Accounting Software', categoryId: 'subscriptions' },
  { id: 'google-workspace', name: 'Google Workspace', categoryId: 'subscriptions' },
  { id: 'saas', name: 'SaaS products', categoryId: 'subscriptions' },
  { id: 'memberships', name: 'Professional Memberships', categoryId: 'subscriptions' },
  { id: 'data', name: 'Data & Research Subscriptions', categoryId: 'subscriptions' },
  
  // Other
  { id: 'contingency', name: 'Business Contingency Fund', categoryId: 'other' },
  { id: 'licenses', name: 'Business Licenses & Permits', categoryId: 'other' },
  { id: 'waste', name: 'Waste Management & Recycling', categoryId: 'other' }
]; 