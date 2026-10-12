# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user, confirmed: the **administrador de turma** (comissão organizadora: professores ou representantes). They open the app to run the class's collective decisions and administration: convites, catálogos de enquetes, respostas a dúvidas, evento, avisos, tarefas, presença e fornecedores.

Other confirmed audiences:

- **Participantes (formandos/alunos)**: belong to one turma, vote, confirmam presença, enviam dúvidas e votam nas dúvidas dos colegas.
- **Master da plataforma**: defined by `ADMIN_MASTER_EMAILS`; sees all turmas and users, manages members and roles in any turma, deletes turmas and users.

## Product Purpose

Formandos is the administrative hub where turmas and organizing committees plan the resources for their graduation event. It exists so a turma can decide together and keep a single record of those decisions, instead of scattering votes and choices across generic forms and chats.

Open decision: no formal success metric was confirmed (e.g. decision completion rate, time-to-decision). Future work must not invent one.

## Positioning

The mechanism a generic form tool cannot truthfully copy: **votação com decisão fixada**. Enquetes are organized by category, votes are identified (the admin sees who voted what and participants can change their vote), and the admin **fixes the turma's decision** on a question — the choice appears on everyone's dashboard and voting on that question closes, with reopening possible. The default catalog ships with 10 predefined categories.

## Operating Context

Confirmed workflows: private invite code per turma; standard catalog plus custom catalogs (including profile templates); single/multiple/exclusive voting; fixed decisions surfaced on the dashboard; Q&A with upvotes and official answers; tasks with owners and deadlines; notice board; RSVP with companions limit per turma; vendor catalog with quoted/committed values visible to admins only; archive or delete a turma; self-service account deletion.

Confirmed environments: celular, tablet e TV. The interface must remain operable by touch, keyboard, and TV remote (D-pad) across these.

Confirmed terminology: turma, comissão/administrador, participante/formando, código de convite, catálogo, categoria, pergunta/enquete, decisão fixada, acompanhantes.

## Capabilities and Constraints

Confirmed functionality: Google login plus email/password with confirmation link; RBAC (only admins create catalogs, answer and highlight dúvidas, manage the event, fix decisions, manage members, archive or delete the turma); identified votes with change allowed; large lists paginated via URL (`?pagina=`); LGPD/SGSI work through phases 1–3 is implemented in the codebase history.

Confirmed technical constraints: single-product Next.js web app; Postgres-backed; master role comes from `ADMIN_MASTER_EMAILS` (no UI for it); deleting a member removes what they left in that turma in a transaction while keeping other members' content.

Explicitly undecided: formal accessibility conformance level (no WCAG target was confirmed as product truth); density trade-offs between admin screens and participant screens beyond the confirmed primary user.

## Brand Commitments

Name: **Formandos**, with the graduation-cap motif (🎓) used in the product UI. UI copy is in pt-BR. No tagline, logo asset, voice guideline, or personality statement was confirmed — future work must not invent one.

## Evidence on Hand

- `README.md`: product scope, roles, decision engine, reports, Q&A, tasks, notices, RSVP, archive/delete, invite flow.
- `docs/Especificação de Requisitos de Software.md` and `docs/Organograma da Aplicação.md`: requirements and application map.
- `src/app/`: route groups `(publico)`, `(onboarding)`, `(app)`, `(admin)`, `(master)`, `(conta)`.

Absences future work must not fabricate: no testimonials, customers, case studies, press, benchmarks, pricing, or deployment claims were observed.

## Product Principles

1. **A comissão decide; o sistema registra.** Admin actions (fixar, responder, arquivar, excluir) are explicit, attributed, and reversible where the product allows (reopen a fixed decision, unarchive a turma).
2. **Uma turma, uma verdade.** Data is scoped per turma; the dashboard, reports, and fixed decisions all read from the same record.
3. **Decisão explícita, não implícita.** A vote tally is not a decision until the admin fixes it; the interface must keep those two states visibly distinct.
4. **Funciona onde a turma está.** Celular, tablet e TV are durable contexts, not edge cases; keyboard, touch, and remote operability constrain every new surface.
5. **Privacidade e segurança acompanham o dado.** LGPD/SGSI constraints (audit trail, scoped visibility such as admin-only values) are preserved by any change that touches data or access.
