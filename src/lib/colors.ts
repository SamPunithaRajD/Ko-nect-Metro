export const KMRL_COLORS = {
  primary: '#E31E24',
  primaryDark: '#B71C1C',
  metroBlue: '#003A8F',
  lightBlue: '#0072CE',
  white: '#FFFFFF',
  lightGrey: '#F2F2F2',
  darkGrey: '#333333',

  status: {
    ready: '#28A745',
    service: '#28A745',
    maintenance: '#E31E24',
    cleaning: '#FFC107',
    standby: '#0072CE',
  }
};

export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    service: KMRL_COLORS.status.service,
    maintenance: KMRL_COLORS.status.maintenance,
    cleaning: KMRL_COLORS.status.cleaning,
    ready: KMRL_COLORS.status.ready,
    standby: KMRL_COLORS.status.standby,
  };

  return statusMap[status] || KMRL_COLORS.darkGrey;
};

export const getStatusBg = (status: string) => {
  const statusMap: Record<string, string> = {
    service: 'rgba(40, 167, 69, 0.1)',
    maintenance: 'rgba(227, 30, 36, 0.1)',
    cleaning: 'rgba(255, 193, 7, 0.1)',
    ready: 'rgba(40, 167, 69, 0.1)',
    standby: 'rgba(0, 114, 206, 0.1)',
  };

  return statusMap[status] || 'rgba(51, 51, 51, 0.1)';
};
