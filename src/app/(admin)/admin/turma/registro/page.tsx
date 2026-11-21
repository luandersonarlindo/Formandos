import { redirect } from "next/navigation";

// O registro da turma é o mesmo para todo membro (ADR-0020) e mora em
// /registro. Esta rota ficou só para links antigos.
export default function RegistroTurmaAdminPage() {
  redirect("/registro");
}
