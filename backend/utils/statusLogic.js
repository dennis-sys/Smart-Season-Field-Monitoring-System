/**
 * Computes field status based on business rules:
 * - Completed: Stage is ''Harvested''
 * - At Risk: No update in >14 days OR >90 days since planting while still 'Growing'
 * - Active: Default healthy state
 */
export const computeStatus = (field) => {
  // Harvested fields are always completed
  if (field.current_stage === 'Harvested') {
    return 'Completed';
  }

  const plantingDate = new Date(field.planting_date);
  const lastUpdate = field.last_update_at ? new Date(field.last_update_at) : plantingDate;
  const now = new Date();
  
  const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
  const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

  // At Risk conditions
  if (daysSinceUpdate > 14) {
    return 'At Risk'; // No recent updates
  }
  
  if (daysSincePlanting > 90 && field.current_stage === 'Growing') {
    return 'At Risk'; // Taking too long to mature
  }
  
  return 'Active';
};