# ASVAB PrepLab

Plataforma independente de preparação para o ASVAB. As questões ficam em inglês americano. A interface, as dicas e as explicações seguem o idioma da rota: `/en`, `/br` ou `/es`.

O ASVAB PrepLab é uma plataforma educacional independente e não é afiliado, endossado nem operado pelo Departamento de Defesa dos Estados Unidos nem pelo programa oficial de aplicação do ASVAB.

## O que está no banco

O banco público validado contém **1.000 questões originais** (`ORIGINAL`), geradas por `scripts/generate_bank.py` e conferidas por `scripts/validate_bank.py`.

| Matéria | Questões |
|---|---:|
| General Science | 120 |
| Arithmetic Reasoning | 120 |
| Word Knowledge | 120 |
| Paragraph Comprehension | 100 |
| Mathematics Knowledge | 120 |
| Electronics Information | 100 |
| Auto Information | 80 |
| Shop Information | 80 |
| Mechanical Comprehension | 80 |
| Assembling Objects | 80 |

Questões oficiais publicadas no banco: **0**. O site oficial trata os itens de prova como material controlado. A página de estrutura foi consultada em 18 de outubro de 2026 (página atualizada em 6 de outubro de 2026) e só a estrutura foi usada.

Os PDFs em `docs/` não são publicados aos estudantes. A importação grava uma quarentena local para o administrador.

## Contas locais

- Estudante: `student@preplab.local` / `PrepLab-Student-2026`
- Administrador: `admin@preplab.local` / `PrepLab-Admin-2026`

## Instalação local

É preciso Node.js 20+, Python 3 com `pymupdf` e Docker.

```powershell
cd ASVAB-PrepLab
copy .env.example .env
npm install
pip install pymupdf
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev
```

Abra `http://localhost:3000/br`.

`db:seed` regrava `content/bank.json` e insere apenas chaves `externalKey` que ainda não existem. Não apaga respostas de usuários.

## Importar PDFs

```powershell
npm run import:pdfs
```

O comando lê `docs/`, escreve `content/quarantine.json` (não versionado) e `relatorios/importacao.md` (somente contagens). O administrador também pode disparar o mesmo fluxo em `/br/admin`. Nenhum item de PDF entra como questão validada.

## Backup

```powershell
npm run db:backup
docker compose exec db pg_dump -U preplab asvab > backup-asvab.sql
```

## Testes

```powershell
npm test
npm run test:bank
npm run lint
```

## Implantação

1. Suba um PostgreSQL e defina `DATABASE_URL` e um `AUTH_SECRET` com pelo menos 32 caracteres.
2. Em HTTPS, defina `COOKIE_SECURE=true`. Em `http://localhost`, deixe essa variável ausente.
3. `npm run db:deploy`
4. `npm run db:seed` na primeira instalação.
5. `npm run build` e `npm start`.

Não há envio de e-mail. O formulário de contato grava a mensagem no banco.

## Funcionalidades

- Rotas `/en`, `/br` e `/es`, com o idioma guardado no cookie do next-intl e, para quem está logado, no perfil.
- Página inicial, páginas institucionais e demonstração da dica da palavra *abundant*.
- Prática por matéria, banco completo em blocos de até 20 questões inéditas, revisão de erros com repetição espaçada.
- CAT-ASVAB sem itens experimentais (135 questões, relógios por seção), prática adaptativa declarada como aproximação, e estrutura em papel (225 questões, 149 minutos).
- Dicas de vocabulário e três níveis de estratégia. No simulado elas começam desligadas. Ligá-las marca o resultado como assistido.
- O gabarito não vai no JSON da questão enquanto o simulado está em andamento.
- Painel com totais reais do usuário e indicador de treino do AFQT, marcado como não oficial.
- Administração: volume, duplicatas, cadastro em revisão e importação em quarentena.

## Limitações

- Não há questões oficiais liberadas no banco. Um simulado “somente oficiais” recusa a sessão em vez de completar com itens originais.
- A adaptação de dificuldade é um degrau fácil/médio/difícil. Não é o algoritmo psicométrico do CAT-ASVAB.
- O indicador AFQT é a precisão nas quatro matérias da sessão. Não é um percentil oficial.
- Os PDFs comerciais e o arquivo com metadados USAREC não foram republicados.
- A revisão gramatical do inglês é a checagem do gerador, não um revisor humano de cada uma das 1.000 questões.
- O cronômetro de prática por matéria usa cerca de um minuto por questão. Os tempos oficiais valem para os simulados CAT e em papel.
- Esta instalação não envia e-mail.
