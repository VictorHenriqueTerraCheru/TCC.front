import type { Schema } from '../../api'

type Usuario = Schema<'AuthResponseUserSummary'> & { password: string }

export const usuariosIniciais: Usuario[] = [
  {
    id: 'u-admin',
    name: 'Admin TCC',
    email: 'admin@tcc.local',
    role: 'administrator',
    password: 'tcc12345',
  },
  {
    id: 'u-verificado',
    name: 'Mariana Souza',
    email: 'verificado@tcc.local',
    role: 'verifiedCitizen',
    password: 'tcc12345',
  },
  {
    id: 'u-cidadao1',
    name: 'Ana Lima',
    email: 'cidadao1@tcc.local',
    role: 'citizen',
    password: 'tcc12345',
  },
  {
    id: 'u-cidadao2',
    name: 'João Pereira',
    email: 'cidadao2@tcc.local',
    role: 'citizen',
    password: 'tcc12345',
  },
]
