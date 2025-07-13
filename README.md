
# EthKipu Portfolio

Este projeto é o meu portfólio de projetos desenvolvidos com tecnologias blockchain, especialmente Ethereum. Aqui você encontrará exemplos, experimentos e aplicações que demonstram meu aprendizado e experiência com smart contracts, integração Web3, e desenvolvimento de soluções descentralizadas.

## Tecnologias Utilizadas

- **React** + **TypeScript** + **Vite** para o frontend
- **TailwindCSS** para estilização
- **Solidity** para contratos inteligentes
- **ESLint** para padronização de código

## Objetivo

Reunir e apresentar meus projetos, estudos e provas de conceito relacionados à blockchain, servindo como vitrine técnica e fonte de aprendizado contínuo.

---

## Sobre o contrato SeedGuard

O contrato `SeedGuard.sol` (localizado em `src/pages/SeedGuard/SeedGuard.sol`) é um exemplo de smart contract escrito em Solidity para armazenar mensagens de forma segura na blockchain. Ele permite que cada usuário salve uma mensagem associada ao seu endereço e recupere essa mensagem posteriormente. O objetivo é demonstrar conceitos de armazenamento descentralizado e privacidade usando Ethereum.

Principais funções:
- `guardarMensagem(string mens)`: armazena uma mensagem para o usuário que chamou a função.
- `lerMensagem()`: retorna a mensagem armazenada pelo usuário.

Esse contrato pode ser expandido para casos de uso como proteção de seeds/mnemonics, cofres digitais, ou provas de conceito de armazenamento seguro.

## Como iniciar o projeto

1. Instale as dependências do frontend:
   ```powershell
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```
3. Acesse `http://localhost:5173` no navegador para visualizar o portfólio.

Para compilar e testar o contrato SeedGuard, recomenda-se utilizar o [Hardhat](https://hardhat.org/) ou [Foundry](https://book.getfoundry.sh/). Basta copiar o arquivo para um projeto desses e seguir a documentação da ferramenta escolhida.

---
