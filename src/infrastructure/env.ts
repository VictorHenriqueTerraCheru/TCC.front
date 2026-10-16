// Variáveis de ambiente lidas uma vez. Ver .env.example.
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
  usarMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const
