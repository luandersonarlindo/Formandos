"use client";

import { LogOut } from "lucide-react";
import { sairDaTurma } from "@/actions/turmas";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";

export function FormSairTurma() {
  return (
    <ConfirmarExclusao
      acao={sairDaTurma}
      campos={{}}
      alvo="da turma"
      verb="Sair"
      nome="a sua participação"
      aviso="Seus votos, dúvidas e resposta de presença desta turma são apagados. Se você for o único membro, a turma também será apagada."
      rotulo="Sair da turma"
      icone={<LogOut aria-hidden />}
      descricao="Sair da turma"
      confirmar="Sim, sair"
    />
  );
}