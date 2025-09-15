export const buildPlanObject = ({
  planName,
  basePrice = 0,
  totalCost = 0,
  slots = 50,
  selectedIntegrations = [],
  additionalSlotsCost = 0,
  integrationCosts = 0,
  billingPeriod = "month",
}) => {
  return {
    planName,
    basePlanPrice: Number(basePrice),
    totalCost: Number(totalCost),
    slots: Number(slots),
    selectedIntegrations: Array.isArray(selectedIntegrations) ? selectedIntegrations : [],
    additionalSlotsCost: Number(additionalSlotsCost),
    integrationCosts: Number(integrationCosts),
    billingPeriod,
  };
};
