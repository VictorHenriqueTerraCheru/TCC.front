import { Icone } from '@/common/components/icone'

interface CampoBuscaProps {
  valor: string
  aoMudar(valor: string): void
  /** Também é o nome acessível do campo. */
  rotulo: string
  placeholder?: string
}

/** Campo de busca em pílula cinza, com lupa e botão de limpar. */
export function CampoBusca({ valor, aoMudar, rotulo, placeholder }: CampoBuscaProps) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-muted-foreground focus-within:outline-2">
      <Icone nome="search" className="text-[20px]" />
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder ?? rotulo}
        aria-label={rotulo}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}
