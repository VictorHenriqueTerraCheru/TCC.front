import type { Schema } from '../../api'

type Usuario = Schema<'RespostaAuthUsuarioResumo'> & { senha: string }

export const usuariosIniciais: Usuario[] = [
  {
    id: 'u-admin',
    nome: 'Admin TCC',
    email: 'admin@tcc.local',
    perfil: 'administrador',
    senha: 'tcc12345',
  },
  {
    id: 'u-verificado',
    nome: 'Mariana Souza',
    email: 'verificado@tcc.local',
    perfil: 'cidadaoVerificado',
    senha: 'tcc12345',
  },
  {
    id: 'u-cidadao1',
    nome: 'Ana Lima',
    email: 'cidadao1@tcc.local',
    perfil: 'cidadao',
    senha: 'tcc12345',
  },
  {
    id: 'u-cidadao2',
    nome: 'João Pereira',
    email: 'cidadao2@tcc.local',
    perfil: 'cidadao',
    senha: 'tcc12345',
  },
]
