# Portfólio Blockchain ETH-KIPU

> Bem-vindo ao meu portfólio de projetos desenvolvidos com tecnologias blockchain, especialmente Ethereum! Aqui você encontra exemplos práticos, experimentos e aplicações que demonstram meu aprendizado e experiência com smart contracts, integração Web3 e desenvolvimento de soluções descentralizadas.

## Sobre o Portfólio

Este site reúne meus principais projetos, estudos e provas de conceito relacionados à blockchain. O objetivo é apresentar minha evolução técnica, compartilhar conhecimento e inspirar outros desenvolvedores.

---

# 🚀 SimpleDEX - Exchange Descentralizada com Pools de Liquidez

## Descrição do Projeto

Este projeto implementa uma exchange descentralizada simples (SimpleDEX) que permite a troca de dois tokens ERC-20 através de pools de liquidez. A solução foi desenvolvida para a rede Scroll Sepolia e implementa o mecanismo de mercado automatizado (AMM) usando a fórmula do produto constante.

## Funcionalidades Implementadas

### ✅ Requisitos Obrigatórios

1. **Dois Tokens ERC-20 Simples**

   - `TokenA` (TKA) - Contrato ERC-20 padrão com funções mint/burn
   - `TokenB` (TKB) - Contrato ERC-20 padrão com funções mint/burn

2. **Contrato SimpleDEX**

   - Mantém pool de liquidez para TokenA e TokenB
   - Implementa fórmula do produto constante: `(x + dx)(y - dy) = xy`
   - Permite adicionar e retirar liquidez (apenas owner)
   - Permite troca de TokenA por TokenB e vice-versa

3. **Funções Obrigatórias Implementadas**

   - `constructor(address _tokenA, address _tokenB)`
   - `addLiquidity(uint256 amountA, uint256 amountB)`
   - `swapAforB(uint256 amountAIn)`
   - `swapBforA(uint256 amountBIn)`
   - `removeLiquidity(uint256 amountA, uint256 amountB)`
   - `getPrice(address _token)`

4. **Eventos Implementados**
   - `LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB)`
   - `LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB)`
   - `SwappedAforB(address indexed user, uint256 amountAIn, uint256 amountBOut)`
   - `SwappedBforA(address indexed user, uint256 amountBIn, uint256 amountAOut)`

## Arquitetura do Sistema

### Contratos Inteligentes

#### 1. TokenA.sol

```solidity
contract TokenA is ERC20 {
    constructor(uint256 initialSupply) ERC20("TokenA", "TKA") {
        _mint(msg.sender, initialSupply);
    }

    // Funções para gestão de supply
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

#### 2. TokenB.sol

```solidity
contract TokenB is ERC20 {
    constructor(uint256 initialSupply) ERC20("TokenB", "TKB") {
        _mint(msg.sender, initialSupply);
    }

    // Funções para gestão de supply
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

#### 3. SimpleDEX.sol

Contrato principal que implementa:

- Gestão de reservas de liquidez
- Mecanismo de swap usando produto constante
- Controle de acesso (apenas owner pode gerenciar liquidez)
- Verificações de segurança robustas

### Frontend React

Interface web desenvolvida em React com TypeScript que oferece:

1. **Conexão com MetaMask**

   - Detecção automática da carteira
   - Verificação de conectividade

2. **Gestão de Tokens (Mint/Burn)**

   - **Mint Tokens**: Criar novos tokens para testes
   - **Burn Tokens**: Queimar tokens para reduzir supply
   - Verificações de saldo antes de burn
   - Atualização automática de saldos

3. **Gestão de Liquidez (Apenas Owner)**

   - Adicionar liquidez com verificações de saldo
   - Remover liquidez com verificações de reservas
   - Validações de permissões

4. **Swap de Tokens**

   - Swap TokenA por TokenB
   - Swap TokenB por TokenA
   - Verificações de saldo e liquidez
   - Cálculo automático de preços

5. **Consultas de Preço**

   - Consulta de preço do TokenA
   - Consulta de preço do TokenB
   - Exibição em tempo real

6. **Monitoramento de Estado**
   - Saldos dos tokens do usuário
   - Reservas do DEX
   - Status das operações

## Boas Práticas Implementadas

### Segurança

- ✅ Verificações de saldo antes das operações
- ✅ Verificações de allowance (permissão) para transferências
- ✅ Validação de endereços no constructor
- ✅ Proteção contra overflow/underflow
- ✅ Verificações de liquidez suficiente
- ✅ Controle de acesso (apenas owner para liquidez)
- ✅ Verificações antes de burn (saldo suficiente)

### UX/UI

- ✅ Interface responsiva e moderna
- ✅ Feedback visual para todas as operações
- ✅ Validações em tempo real
- ✅ Exibição de saldos e reservas
- ✅ Mensagens de erro claras e informativas
- ✅ Botões de cópia de endereços
- ✅ Seção dedicada para gestão de tokens

### Código

- ✅ Tratamento de erros robusto
- ✅ Estados de loading apropriados
- ✅ Atualização automática de dados após operações
- ✅ Código limpo e bem documentado
- ✅ Separação clara de responsabilidades
- ✅ Funções específicas para mint/burn

## Endereços dos Contratos (Scroll Sepolia)

- **SimpleDEX**: `0x2d8454E3AccD8177dC58e3970cB3eF98D7942746`
- **TokenA**: `0xaCA80d00b8e1a18d512E0bC0614aB182b395f4bE`
- **TokenB**: `0x2eBB1f90fFC07e4b34122E115e78d9cf87b80914`

## Como Usar

### 1. Conectar Carteira

- Abra a aplicação
- Conecte sua carteira MetaMask
- Certifique-se de estar na rede Scroll Sepolia

### 2. Gestão de Tokens

- **Mint Tokens**: Crie tokens para testar o DEX
  - Insira a quantidade desejada
  - Clique em "Mint TokenA" ou "Mint TokenB"
- **Burn Tokens**: Queime tokens para reduzir supply
  - Insira a quantidade a queimar
  - Clique em "Burn TokenA" ou "Burn TokenB"
  - Sistema verifica se há saldo suficiente

### 3. Gerenciar Liquidez (Apenas Owner)

- **Adicionar Liquidez**: Insira quantidades de TokenA e TokenB
- **Remover Liquidez**: Especifique quantidades a remover
- Todas as operações verificam saldos e reservas automaticamente

### 4. Realizar Swaps

- **Swap A por B**: Insira quantidade de TokenA para trocar
- **Swap B por A**: Insira quantidade de TokenB para trocar
- O sistema calcula automaticamente a quantidade de saída

### 5. Consultar Preços

- Use os botões para consultar preços dos tokens
- Os preços são calculados em tempo real baseados nas reservas

## Fórmula do Produto Constante

O sistema implementa a fórmula: `(x + dx)(y - dy) = xy`

Onde:

- `x` = reserva do token de entrada
- `y` = reserva do token de saída
- `dx` = quantidade de entrada
- `dy` = quantidade de saída

A quantidade de saída é calculada como:

```
dy = (dx * y) / (x + dx)
```

## Funcionalidades Extras

### 🪙 Gestão de Supply de Tokens

- **Mint**: Permite criar novos tokens para facilitar testes
- **Burn**: Permite queimar tokens para reduzir supply
- **Verificações**: Sistema verifica saldos antes de operações
- **Atualização Automática**: Saldos são atualizados após cada operação

### 🔄 Fluxo de Teste Completo

1. **Mint tokens** para obter saldo inicial
2. **Adicionar liquidez** ao DEX (apenas owner)
3. **Realizar swaps** para testar o mecanismo
4. **Consultar preços** para verificar cálculos
5. **Burn tokens** para limpar saldos (opcional)

## Objetivos de Aprendizagem Alcançados

✅ **Compreensão de DEXs e Pools de Liquidez**

- Implementação completa de um AMM simples
- Gestão de reservas e cálculo de preços

✅ **Criação de Tokens ERC-20**

- Dois tokens funcionais com padrão ERC-20
- Integração com OpenZeppelin
- Funções de mint e burn para gestão de supply

✅ **Mecanismos de Mercado Automatizados**

- Fórmula do produto constante implementada
- Cálculo automático de preços de swap

✅ **Chamada de Contratos Inteligentes**

- Interação entre contratos (tokens e DEX)
- Uso de `transferFrom` e `allowance`
- Gestão de supply de tokens

✅ **Experiência de Usuário Completa**

- Interface para todas as operações
- Verificações de segurança
- Feedback visual e mensagens informativas

---

# 📚 Outros Projetos do Portfólio

## 🎮 BlockChain3D

**Visualização Interativa em 3D dos Conceitos de Blockchain**

Uma experiência imersiva que permite explorar visualmente os conceitos fundamentais de blockchain e Ethereum. O projeto utiliza Three.js para criar uma representação 3D interativa de blocos, transações e contratos inteligentes.

### Características:

- **Visualização 3D**: Exploração interativa de blocos e transações
- **Conceitos Educativos**: Demonstração visual de como funciona a blockchain
- **Interface Imersiva**: Experiência de usuário envolvente e educativa
- **Tecnologias**: React Three Fiber, Three.js, Framer Motion

### Objetivos de Aprendizagem:

- Compreensão visual dos conceitos de blockchain
- Desenvolvimento de interfaces 3D interativas
- Integração de tecnologias Web3 com visualização

---

## 🔐 SeedGuard

**Smart Contract para Armazenamento Seguro de Mensagens**

Sistema de armazenamento descentralizado que permite aos usuários armazenar mensagens de forma segura na blockchain Ethereum. Demonstra conceitos avançados de privacidade e armazenamento descentralizado.

### Características:

- **Armazenamento Seguro**: Mensagens criptografadas na blockchain
- **Privacidade**: Sistema de chaves e criptografia
- **Descentralizado**: Sem dependência de servidores centralizados
- **Interface Intuitiva**: Fácil gerenciamento de mensagens

### Objetivos de Aprendizagem:

- Implementação de criptografia em smart contracts
- Gestão de privacidade em aplicações descentralizadas
- Desenvolvimento de sistemas de armazenamento seguro

---

## 🏦 KipuBank

**Banco Digital Descentralizado**

Sistema bancário descentralizado completo com operações de depósito, saque e consulta de saldo via smart contract. Demonstra como criar serviços financeiros tradicionais usando blockchain.

### Características:

- **Operações Bancárias**: Depósito, saque e consulta de saldo
- **Smart Contract**: Lógica bancária implementada na blockchain
- **Interface Web**: Dashboard completo para gerenciar operações
- **Segurança**: Verificações e validações robustas

### Objetivos de Aprendizagem:

- Desenvolvimento de aplicações financeiras descentralizadas
- Implementação de lógica bancária em smart contracts
- Gestão de saldos e transações seguras

---

## 💰 Cofre

**Gerenciamento de Saldo e Transações Internas**

Sistema de cofre digital que permite gerenciar saldos e realizar transações internas entre contratos Ethereum, simulando um cofre digital seguro.

### Características:

- **Gerenciamento de Saldo**: Controle de fundos em contratos
- **Transações Internas**: Transferências entre contratos
- **Segurança**: Múltiplas camadas de proteção
- **Auditoria**: Rastreamento completo de transações

### Objetivos de Aprendizagem:

- Interação entre múltiplos smart contracts
- Gestão de fundos e transações internas
- Implementação de sistemas de auditoria

---

## 🛠️ Tecnologias Utilizadas

### Smart Contracts

- **Solidity 0.8.19**: Linguagem principal para desenvolvimento de contratos
- **OpenZeppelin**: Biblioteca de contratos seguros e testados
- **Hardhat/Foundry**: Ferramentas de desenvolvimento e teste

### Frontend

- **React 18 + TypeScript**: Framework principal para interfaces
- **Ethers.js v6**: Biblioteca para interação com Ethereum
- **Tailwind CSS**: Framework CSS para estilização
- **React Three Fiber**: Para visualizações 3D

### Web3 & Blockchain

- **MetaMask**: Carteira para interação com dApps
- **Scroll Sepolia**: Rede de teste para desenvolvimento
- **IPFS**: Armazenamento descentralizado (quando aplicável)

### Ferramentas de Desenvolvimento

- **Vite**: Build tool e servidor de desenvolvimento
- **TypeScript**: Tipagem estática para JavaScript
- **ESLint**: Linting e formatação de código
- **Git**: Controle de versão

---

## 🎯 Objetivos de Aprendizagem Gerais

### Blockchain & Ethereum

- ✅ Compreensão profunda de smart contracts
- ✅ Desenvolvimento de tokens ERC-20
- ✅ Implementação de DEXs e AMMs
- ✅ Gestão de liquidez e pools
- ✅ Segurança em contratos inteligentes
- ✅ Gestão de supply de tokens (mint/burn)

### Desenvolvimento Web3

- ✅ Integração de frontend com blockchain
- ✅ Uso de bibliotecas Web3 (Ethers.js)
- ✅ Conexão com carteiras (MetaMask)
- ✅ Tratamento de transações e eventos

### UX/UI & Interação

- ✅ Interfaces responsivas e modernas
- ✅ Experiências 3D interativas
- ✅ Feedback visual para operações blockchain
- ✅ Validações e tratamento de erros

### Arquitetura & Boas Práticas

- ✅ Separação de responsabilidades
- ✅ Código limpo e documentado
- ✅ Tratamento robusto de erros
- ✅ Testes e validações

---

## 📁 Estrutura do Projeto

```
├── public/
│   ├── SimpleDEX.sol          # Contrato principal do DEX
│   ├── TokenA.sol             # Token A com mint/burn
│   ├── TokenB.sol             # Token B com mint/burn
│   └── [outros contratos]     # Contratos dos outros projetos
├── src/
│   ├── pages/
│   │   ├── SimpleDex/         # Interface do SimpleDEX
│   │   ├── BlockChain3D/      # Visualização 3D
│   │   ├── SeedGuard/         # Sistema de mensagens
│   │   ├── KipuBank/          # Banco descentralizado
│   │   └── Cofre/             # Sistema de cofre
│   ├── components/            # Componentes reutilizáveis
│   └── [outros arquivos]      # Configurações e utilitários
├── package.json
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- MetaMask configurado
- Rede Scroll Sepolia adicionada ao MetaMask

### Instalação

```bash
# Clonar o repositório
git clone [url-do-repositorio]

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração da Rede

1. Adicione a rede Scroll Sepolia ao MetaMask:

   - **RPC URL**: `https://sepolia-rpc.scroll.io`
   - **Chain ID**: `534351`
   - **Símbolo**: `ETH`

2. Obtenha ETH de teste no faucet oficial da Scroll

---

## 📞 Contato

Fique à vontade para entrar em contato pelo e-mail: **joubert2006@hotmail.com**

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração. Sinta-se livre para usar, modificar e distribuir conforme necessário.

---

_Desenvolvido com ❤️ e ☕ para a comunidade blockchain_
