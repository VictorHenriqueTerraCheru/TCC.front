import type { Schema } from '../../api'

type User = Schema<'AuthResponseUserSummary'> & { password: string }

export const initialUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Admin TCC',
    email: 'admin@tcc.local',
    role: 'administrator',
    password: 'tcc12345',
  },
  {
    id: 'u-verified',
    name: 'Mariana Souza',
    email: 'verificado@tcc.local',
    role: 'verifiedCitizen',
    password: 'tcc12345',
  },
  {
    id: 'u-citizen1',
    name: 'Ana Lima',
    email: 'cidadao1@tcc.local',
    role: 'citizen',
    password: 'tcc12345',
  },
  {
    id: 'u-citizen2',
    name: 'João Pereira',
    email: 'cidadao2@tcc.local',
    role: 'citizen',
    password: 'tcc12345',
  },
]
