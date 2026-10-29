import type { MaterialSymbol } from 'material-symbols'
import { useNavigate } from 'react-router'

import { FolhaResponsiva } from '@/common/components/folha-responsiva'
import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

import { useGuardaStore, type MotivoConta } from '../stores/guarda-store'
import { AvisoExpirou } from './aviso-expirou'

interface Conteudo {
  icon: MaterialSymbol
  titulo: string
  texto: string
  items: [MaterialSymbol, string][]
}

const conteudos: Record<MotivoConta, Conteudo> = {
  votar: {
    icon: 'how_to_vote',
    titulo: 'Entre para votar',
    texto:
      'Seu voto ajuda a mostrar o que é confiável no mapa. Para evitar votos repetidos, cada voto fica ligado a uma conta.',
    items: [
      ['verified', 'Confirmar que um problema existe'],
      ['autorenew', 'Dizer se ele ainda está lá'],
      ['near_me', 'Ter mais peso quando estiver perto'],
    ],
  },
  registrar: {
    icon: 'person_add',
    titulo: 'Entre para registrar',
    texto:
      'Cada registro fica ligado a uma conta — é isso que permite medir a confiança do que aparece no mapa. Sem conta, você continua vendo o mapa normalmente.',
    items: [
      ['add_location_alt', 'Registrar problemas e incidentes'],
      ['how_to_vote', 'Confirmar e avaliar ocorrências perto de você'],
      ['history', 'Acompanhar o andamento dos seus registros'],
    ],
  },
}

export function EntreParaContinuar() {
  const motivo = useGuardaStore((s) => s.reason)
  const expirou = useGuardaStore((s) => s.expirou)
  const fecharFolha = useGuardaStore((s) => s.fecharFolha)
  const descartar = useGuardaStore((s) => s.descartar)
  const navigate = useNavigate()
  const conteudo = conteudos[motivo ?? 'votar']

  function irPara(rota: string) {
    fecharFolha()
    navigate(rota)
  }

  return (
    <FolhaResponsiva
      aberto={motivo !== null}
      aoMudarAberto={(aberto) => !aberto && descartar()}
      titulo={conteudo.titulo}
      icon={
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primario-suave text-primario">
          <Icone name={conteudo.icon} className="text-[28px]" />
        </span>
      }
    >
      {expirou && <AvisoExpirou />}
      <p className="mb-4 text-sm text-muted-foreground">{conteudo.texto}</p>
      <ul className="mb-6 space-y-3">
        {conteudo.items.map(([icone, texto]) => (
          <li key={texto} className="flex items-center gap-3 text-sm">
            <Icone name={icone} className="text-[22px] text-primario" />
            {texto}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button onClick={() => irPara('/cadastro')}>Criar conta</Button>
        <Button variant="outline" onClick={() => irPara('/login')}>
          Já tenho conta
        </Button>
        <Button variant="ghost" onClick={descartar}>
          Agora não
        </Button>
      </div>
    </FolhaResponsiva>
  )
}
