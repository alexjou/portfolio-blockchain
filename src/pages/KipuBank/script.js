const contratoAddress = "0xd2f44f2edccbbac4b1d058c6ddaebfb203681bd6"; // Você precisará atualizar com o endereço correto após implantar o contrato

// Função auxiliar para formatar ETH de maneira consistente em todo o aplicativo
function formatarETH(valor, casasDecimais = 8) {
  if (typeof valor === 'bigint' || typeof valor === 'object') {
    // Se for BigInt ou objeto BigNumber do ethers
    const valorStr = parseFloat(ethers.formatEther(valor)).toFixed(casasDecimais);
    return valorStr.replace(/\.?0+$/, '') + " ETH";
  } else {
    // Se já for um número ou string
    const valorStr = parseFloat(valor).toFixed(casasDecimais);
    return valorStr.replace(/\.?0+$/, '') + " ETH";
  }
}

const contratoABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_bankCap",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "FailedDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "FailedWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "bankCap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBankBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBankCap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDeposits",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newCap",
        "type": "uint256"
      }
    ],
    "name": "updateBankCap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// variáveis padrão
let provider, signer, contrato;

// Função para mostrar/esconder loader durante transações
function mostrarLoader(exibir = true, elemento = null, texto = 'Processando...') {
  // Se um elemento específico foi fornecido, mostra o loader apenas nele
  if (elemento) {
    if (exibir) {
      // Salvar o texto original
      if (!elemento.getAttribute('data-texto-original')) {
        elemento.setAttribute('data-texto-original', elemento.textContent);
      }

      // Adicionar loader e texto
      elemento.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div> ${texto}`;
      elemento.disabled = true;
    } else {
      // Restaurar o texto original
      elemento.textContent = elemento.getAttribute('data-texto-original') || elemento.textContent;
      elemento.disabled = false;
    }
    return;
  }

  // Se nenhum elemento foi especificado, usar um loader global
  let loaderContainer = document.getElementById('loader-global');

  // Criar loader global se não existir
  if (!loaderContainer && exibir) {
    loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-global';
    loaderContainer.style.position = 'fixed';
    loaderContainer.style.top = '0';
    loaderContainer.style.left = '0';
    loaderContainer.style.width = '100%';
    loaderContainer.style.height = '100%';
    loaderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loaderContainer.style.display = 'flex';
    loaderContainer.style.justifyContent = 'center';
    loaderContainer.style.alignItems = 'center';
    loaderContainer.style.zIndex = '9999';

    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-light';
    spinner.style.width = '3rem';
    spinner.style.height = '3rem';
    spinner.setAttribute('role', 'status');

    const textSpan = document.createElement('span');
    textSpan.className = 'ms-2 text-white';
    textSpan.textContent = texto;

    const contentDiv = document.createElement('div');
    contentDiv.style.textAlign = 'center';
    contentDiv.appendChild(spinner);
    contentDiv.appendChild(textSpan);

    loaderContainer.appendChild(contentDiv);
    document.body.appendChild(loaderContainer);
  } else if (loaderContainer) {
    loaderContainer.style.display = exibir ? 'flex' : 'none';
    if (exibir) {
      const textSpan = loaderContainer.querySelector('.ms-2');
      if (textSpan) textSpan.textContent = texto;
    }
  }
}

// conexão com a metamask
async function conectar() {
  try {
    // Verificar se MetaMask está instalada
    if (typeof window.ethereum === 'undefined') {
      mostrarToastAviso("MetaMask não está instalada! Por favor, instale a extensão MetaMask no seu navegador.", "error");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    // Verificar se é realmente MetaMask
    if (!window.ethereum.isMetaMask) {
      mostrarToastAviso("Por favor, use a extensão MetaMask oficial.", "warning");
      return;
    }

    console.log("Solicitando conexão com MetaMask...");

    // Mostrar loader durante a conexão
    const btnConectar = document.getElementById("btn-conectar");
    mostrarLoader(true, btnConectar, "Conectando...");

    // Solicitar acesso às contas
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      mostrarToastAviso("Nenhuma conta foi selecionada. Por favor, desbloqueie sua MetaMask e tente novamente.", "warning");
      return;
    }

    console.log("Contas conectadas:", accounts);

    // Criar provider e signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Obter informações da rede
    const network = await provider.getNetwork();
    console.log("Rede conectada:", network);

    // Verificar se está na rede correta (Sepolia)
    if (network.chainId !== 11155111n) {
      mostrarToastAviso(`Rede incorreta! Por favor, conecte à rede Sepolia. Rede atual: ${network.name} (Chain ID: ${network.chainId}). Rede esperada: Sepolia (Chain ID: 11155111)`, "error");
      return;
    }

    // Obter endereço da conta
    const address = await signer.getAddress();
    console.log("Endereço da conta:", address);

    // Verificar se o contrato existe na rede
    const contractCode = await provider.getCode(contratoAddress);
    if (contractCode === '0x') {
      mostrarToastAviso(`Contrato não encontrado no endereço ${contratoAddress} na rede Sepolia. Verifique se o contrato foi implantado corretamente.`, "error");
      return;
    }

    console.log("Contrato encontrado na rede!");

    // Criar instância do contrato
    contrato = new ethers.Contract(contratoAddress, contratoABI, signer);

    // Atualizar interface com informações do banco
    await atualizarInformacoesBanco();

    // Exibir mostrarToastAvisoa de conexão bem-sucedida
    mostrarToastAviso(`Carteira conectada com sucesso! Endereço: ${address.slice(0, 6)}...${address.slice(-4)}`, "success");

    // Esconder loader após conexão
    mostrarLoader(false);

    // Remover o mostrarToastAvisoa tradicional e manter apenas o toast
    // mostrarToastAviso(`Carteira conectada com sucesso!\nEndereço: ${address}\nRede: ${network.name} (Chain ID: ${network.chainId})`);

    // Atualizar interface para mostrar status de conexão
    const conectarBtn = document.getElementById("btn-conectar");
    if (conectarBtn) {
      conectarBtn.textContent = "Carteira Conectada ✓";
      conectarBtn.style.backgroundColor = "#28a745";
      conectarBtn.disabled = true;
    }

    // Mostrar seções para depósitos e saques
    document.getElementById("secao-operacoes").style.display = "block";

    // Atualizar informações do contrato na interface
    atualizarInfoContrato();

  } catch (error) {
    console.error("Erro ao conectar com MetaMask:", error);

    // Esconder loader em caso de erro
    mostrarLoader(false);

    // Tratar diferentes tipos de erro
    if (error.code === 4001) {
      mostrarToastAviso("Conexão rejeitada pelo usuário", "warning");
      mostrarToastAviso("Conexão rejeitada pelo usuário. Por favor, aceite a conexão na MetaMask.");
    } else if (error.code === -32002) {
      mostrarToastAviso("Solicitação de conexão pendente", "warning");
      mostrarToastAviso("Solicitação de conexão pendente. Por favor, verifique sua MetaMask.");
    } else if (error.message && error.message.includes("User rejected")) {
      mostrarToastAviso("Conexão rejeitada", "warning");
      mostrarToastAviso("Conexão rejeitada. Por favor, aceite a conexão na MetaMask.");
    } else {
      mostrarToastAviso(`Erro ao conectar: ${error.message?.slice(0, 30) || "Erro desconhecido"}...`, "error");
      mostrarToastAviso(`Erro ao conectar: ${error.message || "Erro desconhecido. Verifique se a MetaMask está desbloqueada."}`);
    }
  }
}

//funções de contrato (especificadas)
async function guardar() {
  try {
    if (!contrato) {
      mostrarToastAviso("Por favor, conecte sua carteira primeiro!");
      return;
    }

    const text = document.getElementById("input-mensagem").value;
    if (!text.trim()) {
      mostrarToastAviso("Por favor, digite uma mensagem antes de guardar!");
      return;
    }

    console.log("Enviando mensagem:", text);

    // Verificar se estamos na rede correta antes de enviar
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      mostrarToastAviso(`Erro: Você está na rede ${network.name} (Chain ID: ${network.chainId})\nPor favor, conecte à rede Sepolia (Chain ID: 11155111)`);
      return;
    }

    // Mostrar loading
    const guardarBtn = document.getElementById("btn-guardar");
    mostrarLoader(true, guardarBtn, "Guardando...");

    // Verificar saldo antes de enviar transação
    const balance = await provider.getBalance(await signer.getAddress());
    console.log("Saldo da conta:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      mostrarToastAviso("Saldo insuficiente! Você precisa de ETH de teste (Sepolia) para enviar transações.\nVisite um faucet de Sepolia para obter ETH de teste.");
      mostrarLoader(false, guardarBtn);
      return;
    }

    const tx = await contrato.guardarMensagem(text);
    console.log("Transação enviada:", tx.hash);

    mostrarToastAviso(`Transação enviada! Hash: ${tx.hash}\nAguardando confirmação...`);

    await tx.wait();
    // Esconder loader global
    mostrarLoader(false);

    // Atualizar interface
    await atualizarInformacoesBanco();

    mostrarToastAviso("Mensagem guardada com sucesso!");

    // Limpar input
    document.getElementById("input-mensagem").value = "";

    // Restaurar botão
    mostrarLoader(false, guardarBtn);

  } catch (error) {
    console.error("Erro ao guardar mensagem:", error);

    // Restaurar botão em caso de erro
    const guardarBtn = document.getElementById("btn-guardar");
    mostrarLoader(false, guardarBtn);

    if (error.code === 4001) {
      mostrarToastAviso("Transação rejeitada pelo usuário.");
    } else if (error.code === -32602) {
      mostrarToastAviso("Erro de RPC: Verifique se você está conectado à rede Sepolia e se o contrato existe nesta rede.");
    } else if (error.message && error.message.includes("insufficient funds")) {
      mostrarToastAviso("Saldo insuficiente para executar a transação. Você precisa de ETH de teste (Sepolia).");
    } else if (error.message && error.message.includes("External transactions to internal accounts")) {
      mostrarToastAviso("Erro de rede: Você está conectado a uma rede que não suporta contratos inteligentes.\nPor favor, conecte à rede Sepolia.");
    } else if (error.message && error.message.includes("network")) {
      mostrarToastAviso("Erro de rede: Verifique sua conexão e se está na rede Sepolia.");
    } else {
      mostrarToastAviso(`Erro ao guardar mensagem: ${error.message || "Erro desconhecido"}\nCódigo: ${error.code || "N/A"}`);
    }
  }
}

async function ler() {
  try {
    if (!contrato) {
      mostrarToastAviso("Por favor, conecte sua carteira primeiro!");
      return;
    }
    console.log("Lendo mensagem do contrato...");
    // Mostrar loading
    const lerBtn = document.getElementById("btn-ler");
    mostrarLoader(true, lerBtn, "Lendo...");

    const msg = await contrato.lerMensagem();
    console.log("Mensagem lida:", msg);

    const outputElement = document.getElementById("mensagem-resultado");
    if (msg && msg.trim()) {
      outputElement.textContent = msg;
      outputElement.style.backgroundColor = "#d4edda";
      outputElement.style.color = "#155724";
      mostrarToastAviso("Mensagem lida com sucesso!");
    } else {
      outputElement.textContent = "Nenhuma mensagem encontrada ou mensagem vazia.";
      outputElement.style.backgroundColor = "#f8d7da";
      outputElement.style.color = "#721c24";
    }

    // Restaurar botão
    mostrarLoader(false, lerBtn);

  } catch (error) {
    console.error("Erro ao ler mensagem:", error);

    // Restaurar botão em caso de erro
    const lerBtn = document.getElementById("btn-ler");
    mostrarLoader(false, lerBtn);

    const outputElement = document.getElementById("mensagem-resultado");
    outputElement.textContent = `Erro ao ler mensagem: ${error.message || "Erro desconhecido"}`;
    outputElement.style.backgroundColor = "#f8d7da";
    outputElement.style.color = "#721c24";

    mostrarToastAviso(`Erro ao ler mensagem: ${error.message || "Erro desconhecido"}`);
  }
}

// Função para atualizar informações do contrato no HTML
function atualizarInfoContrato() {
  const contractLink = document.getElementById("contract-link");
  if (contractLink) {
    contractLink.href = `https://sepolia.etherscan.io/address/${contratoAddress}`;
    contractLink.textContent = contratoAddress;

    // Adicionar título com endereço completo para exibir no hover
    contractLink.title = `Endereço do contrato: ${contratoAddress}`;

    // Garantir que o estilo está adequado
    contractLink.style.overflowWrap = "break-word";
    contractLink.style.wordBreak = "break-all";
    contractLink.style.display = "inline-block";
    contractLink.style.maxWidth = "100%";
  }
}

async function atualizarInformacoesBanco() {
  try {
    if (!contrato) return;

    // Mostrar loader durante atualização
    const btnAtualizar = document.getElementById("btn-atualizar");
    if (btnAtualizar) {
      mostrarLoader(true, btnAtualizar, "Atualizando...");
    }

    // Obter saldo do usuário com tratamento de erro
    try {
      const userBalance = await contrato.getUserBalance();
      const saldoFormatado = formatarETH(userBalance);
      document.getElementById("saldo-usuario").textContent = saldoFormatado;
      document.getElementById("saldo-usuario").title = `Valor exato: ${ethers.formatEther(userBalance)} ETH`;
    } catch (err) {
      console.warn("Erro ao obter saldo do usuário:", err);
      document.getElementById("saldo-usuario").textContent = "Erro ao carregar";
    }

    // Obter saldo total do banco com tratamento de erro
    try {
      const bankBalance = await contrato.getBankBalance();
      const saldoFormatado = formatarETH(bankBalance);
      document.getElementById("saldo-banco").textContent = saldoFormatado;
      document.getElementById("saldo-banco").title = `Valor exato: ${ethers.formatEther(bankBalance)} ETH`;
    } catch (err) {
      console.warn("Erro ao obter saldo do banco:", err);
      document.getElementById("saldo-banco").textContent = "Erro ao carregar";
    }

    // Obter limite do banco com tratamento de erro
    try {
      const bankCap = await contrato.getBankCap();
      const limiteFormatado = formatarETH(bankCap);
      document.getElementById("limite-banco").textContent = limiteFormatado;
      document.getElementById("limite-banco").title = `Valor exato: ${ethers.formatEther(bankCap)} ETH`;

      // Adicionar informação sobre espaço disponível
      try {
        const bankBalance = await contrato.getBankBalance();
        const espacoDisponivel = bankCap - bankBalance;
        if (espacoDisponivel > 0) {
          const porcentagemUtilizada = (Number(bankBalance) / Number(bankCap) * 100).toFixed(2);
          const espacoFormatado = formatarETH(espacoDisponivel);

          document.getElementById("espaco-disponivel").innerHTML =
            `<div>${espacoFormatado} disponíveis</div><div style="margin-top: 5px; font-size: 0.9em;">(${porcentagemUtilizada}% utilizado)</div>`;

          // Definir cores baseadas na porcentagem utilizada
          let corStatus;
          if (porcentagemUtilizada > 90) {
            corStatus = "#dc3545"; // vermelho - quase cheio
          } else if (porcentagemUtilizada > 70) {
            corStatus = "#ffc107"; // amarelo - atenção
          } else {
            corStatus = "#28a745"; // verde - espaço disponível
          }

          document.getElementById("espaco-disponivel").style.color = corStatus;
        } else {
          document.getElementById("espaco-disponivel").innerHTML =
            `<div style="font-weight: bold;">Banco está cheio!</div>
             <div style="margin-top: 5px;">Não é possível fazer mais depósitos.</div>`;
          document.getElementById("espaco-disponivel").style.color = "#dc3545";
        }
      } catch (err) {
        console.warn("Erro ao calcular espaço disponível:", err);
      }
    } catch (err) {
      console.warn("Erro ao obter limite do banco:", err);
      document.getElementById("limite-banco").textContent = "Erro ao carregar";
    }

    // Mostrar toast de aviso que o saldo foi atualizado
    mostrarToastAviso("Saldos atualizados com sucesso!", "success");

    // Esconder loader após atualização
    if (btnAtualizar) {
      mostrarLoader(false, btnAtualizar);
    }

  } catch (error) {
    console.error("Erro ao atualizar informações do banco:", error);
    mostrarToastAviso("Erro ao atualizar saldos!", "error");

    // Esconder loader em caso de erro
    if (btnAtualizar) {
      mostrarLoader(false, btnAtualizar);
    }
  }
}

// Função para realizar um depósito
async function depositar() {
  try {
    if (!contrato) {
      mostrarToastAviso("Por favor, conecte sua carteira primeiro!");
      return;
    }

    const valorString = document.getElementById("valor-deposito").value;
    if (!valorString || parseFloat(valorString) <= 0) {
      mostrarToastAviso("Por favor, insira um valor válido maior que zero!");
      return;
    }

    // Converter para wei (a menor unidade do Ethereum)
    const valor = ethers.parseEther(valorString);
    console.log("Enviando depósito:", ethers.formatEther(valor), "ETH");

    // Verificar se estamos na rede correta antes de enviar
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      mostrarToastAviso(`Erro: Você está na rede ${network.name} (Chain ID: ${network.chainId})\nPor favor, conecte à rede Sepolia (Chain ID: 11155111)`);
      return;
    }

    // Verificar se o limite do banco permite o depósito
    try {
      const bankBalance = await contrato.getBankBalance();
      const bankCap = await contrato.getBankCap();
      const espacoDisponivel = bankCap - bankBalance;

      if (valor > espacoDisponivel) {
        mostrarToastAviso(`Este depósito excederá o limite do banco!\n\nEspaço disponível: ${formatarETH(espacoDisponivel)}\nValor do depósito: ${formatarETH(valor)}\n\nPor favor, reduza o valor do depósito.`);
        return;
      }

      console.log("Verificação de espaço: OK. Espaço disponível:", ethers.formatEther(espacoDisponivel), "ETH");
    } catch (capError) {
      console.warn("Não foi possível verificar o limite do banco:", capError);
      // Continuamos mesmo sem conseguir verificar o limite, o contrato fará essa verificação
    }

    // Mostrar loading
    const depositarBtn = document.getElementById("btn-depositar");
    mostrarLoader(true, depositarBtn, "Depositando...");

    // Verificar saldo antes de enviar transação
    const balance = await provider.getBalance(await signer.getAddress());
    console.log("Saldo da conta:", ethers.formatEther(balance), "ETH");

    if (balance < valor) {
      mostrarToastAviso("Saldo insuficiente! Você não tem ETH suficiente para este depósito.");
      mostrarLoader(false, depositarBtn);
      return;
    }

    const tx = await contrato.deposit({ value: valor });
    console.log("Transação enviada:", tx.hash);

    document.getElementById("status-transacao").textContent = `Depósito em processamento... Hash: ${tx.hash}`;
    document.getElementById("status-transacao").style.display = "block";

    // Mostrar loader global durante confirmação
    mostrarLoader(true, null, "Confirmando transação na blockchain...");

    // Aguardar confirmação da transação
    await tx.wait();
    // Esconder loader global
    mostrarLoader(false);

    // Atualizar interface
    await atualizarInformacoesBanco();

    // Formatar o valor para exibição
    const valorFormatado = parseFloat(ethers.formatEther(valor)).toFixed(6).replace(/\.?0+$/, '');

    document.getElementById("status-transacao").textContent = `Depósito de ${valorFormatado} ETH realizado com sucesso!`;
    document.getElementById("status-transacao").style.backgroundColor = "#d4edda";
    document.getElementById("valor-deposito").value = "";

    // Mostrar toast de sucesso
    mostrarToastAviso(`Depósito de ${valorFormatado} ETH realizado com sucesso!`, "success");

    // Restaurar botão
    mostrarLoader(false, depositarBtn);

  } catch (error) {
    console.error("Erro ao depositar:", error);

    // Restaurar botão em caso de erro
    const depositarBtn = document.getElementById("btn-depositar");
    mostrarLoader(false, depositarBtn);

    document.getElementById("status-transacao").textContent = `Erro no depósito: ${error.message || "Erro desconhecido"}`;
    document.getElementById("status-transacao").style.backgroundColor = "#f8d7da";
    document.getElementById("status-transacao").style.display = "block";

    if (error.code === 4001) {
      mostrarToastAviso("Transação rejeitada pelo usuário", "warning");
    } else if (error.message && error.message.includes("Deposito excede o limite do banco")) {
      // Obter informações atuais para fornecer detalhes mais úteis
      const bankBalance = await contrato.getBankBalance().catch(() => "desconhecido");
      const bankCap = await contrato.getBankCap().catch(() => "desconhecido");

      // Formatar os valores para exibição, se estiverem disponíveis
      const formattedBalance = bankBalance !== "desconhecido" ? formatarETH(bankBalance) : "desconhecido";
      const formattedCap = bankCap !== "desconhecido" ? formatarETH(bankCap) : "desconhecido";

      const mensagem = `Depósito excede o limite do banco! Saldo atual: ${formattedBalance}, Limite: ${formattedCap}`;
      mostrarToastAviso(mensagem, "error");
      mostrarToastAviso(`Depósito excede o limite do banco!\n\nSaldo atual do banco: ${formattedBalance}\nLimite máximo: ${formattedCap}\n\nTente um valor menor ou entre em contato com o proprietário do banco para aumentar o limite.`);
    } else if (error.message && error.message.includes("insufficient funds")) {
      mostrarToastAviso("Saldo insuficiente para executar a transação", "error");
      mostrarToastAviso("Saldo insuficiente para executar a transação.");
    } else {
      mostrarToastAviso(`Erro ao depositar: ${error.message || "Erro desconhecido"}`, "error");
      mostrarToastAviso(`Erro ao depositar: ${error.message || "Erro desconhecido"}`);
    }
  }
}

// Função para realizar um saque
async function sacar() {
  try {
    if (!contrato) {
      mostrarToastAviso("Por favor, conecte sua carteira primeiro!");
      return;
    }

    const valorString = document.getElementById("valor-saque").value;
    if (!valorString || parseFloat(valorString) <= 0) {
      mostrarToastAviso("Por favor, insira um valor válido maior que zero!");
      return;
    }

    // Converter para wei (a menor unidade do Ethereum)
    const valor = ethers.parseEther(valorString);
    console.log("Enviando saque:", ethers.formatEther(valor), "ETH");

    // Mostrar loading
    const sacarBtn = document.getElementById("btn-sacar");
    mostrarLoader(true, sacarBtn, "Sacando...");

    // Verificar se o usuário tem saldo suficiente
    try {
      const userBalance = await contrato.getUserBalance();
      console.log("Saldo do usuário:", ethers.formatEther(userBalance), "ETH");

      if (userBalance < valor) {
        mostrarToastAviso(`Saldo insuficiente!\n\nSeu saldo: ${formatarETH(userBalance)}\nValor do saque: ${formatarETH(valor)}\n\nVocê não tem fundos suficientes para este saque.`);
        mostrarLoader(false, sacarBtn);
        return;
      }
    } catch (balanceError) {
      console.error("Erro ao verificar saldo:", balanceError);
      mostrarToastAviso("Não foi possível verificar seu saldo. Tente novamente mais tarde.");
      mostrarLoader(false, sacarBtn);
      return;
    }

    const tx = await contrato.withdraw(valor);
    console.log("Transação enviada:", tx.hash);

    document.getElementById("status-transacao").textContent = `Saque em processamento... Hash: ${tx.hash}`;
    document.getElementById("status-transacao").style.display = "block";

    // Mostrar loader global durante confirmação
    mostrarLoader(true, null, "Confirmando transação na blockchain...");

    // Aguardar confirmação da transação
    await tx.wait();
    // Esconder loader global
    mostrarLoader(false);

    // Atualizar interface
    await atualizarInformacoesBanco();

    // Formatar o valor para exibição
    const valorFormatado = parseFloat(ethers.formatEther(valor)).toFixed(6).replace(/\.?0+$/, '');

    document.getElementById("status-transacao").textContent = `Saque de ${valorFormatado} ETH realizado com sucesso!`;
    document.getElementById("status-transacao").style.backgroundColor = "#d4edda";
    document.getElementById("valor-saque").value = "";

    // Mostrar toast de sucesso
    mostrarToastAviso(`Saque de ${valorFormatado} ETH realizado com sucesso!`, "success");

    // Restaurar botão
    mostrarLoader(false, sacarBtn);

  } catch (error) {
    console.error("Erro ao sacar:", error);

    // Restaurar botão em caso de erro
    const sacarBtn = document.getElementById("btn-sacar");
    mostrarLoader(false, sacarBtn);

    document.getElementById("status-transacao").textContent = `Erro no saque: ${error.message || "Erro desconhecido"}`;
    document.getElementById("status-transacao").style.backgroundColor = "#f8d7da";
    document.getElementById("status-transacao").style.display = "block";

    if (error.code === 4001) {
      mostrarToastAviso("Transação rejeitada pelo usuário", "warning");
      mostrarToastAviso("Transação rejeitada pelo usuário.");
    } else if (error.message && error.message.includes("insufficient balance")) {
      mostrarToastAviso("Saldo insuficiente para este saque!", "error");
      mostrarToastAviso("Saldo insuficiente para este saque!");
    } else {
      mostrarToastAviso(`Erro ao sacar: ${error.message || "Erro desconhecido"}`, "error");
      mostrarToastAviso(`Erro ao sacar: ${error.message || "Erro desconhecido"}`);
    }
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Adicionar estilos CSS para spinners de loading
  const style = document.createElement('style');
  style.textContent = `
    .spinner-border {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      vertical-align: text-bottom;
      border: 0.2em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-border .75s linear infinite;
    }
    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
      border-width: 0.2em;
      margin-right: 0.5rem;
    }
    .ms-2 {
      margin-left: 0.5rem;
    }
    .text-white {
      color: white;
    }
    .text-light {
      color: #f8f9fa;
    }
  `;
  document.head.appendChild(style);

  // Botões
  const conectarBtn = document.getElementById("btn-conectar");
  const depositarBtn = document.getElementById("btn-depositar");
  const sacarBtn = document.getElementById("btn-sacar");
  const atualizarBtn = document.getElementById("btn-atualizar");
  const atualizarCapBtn = document.getElementById("btn-atualizar-cap");

  if (conectarBtn) conectarBtn.addEventListener('click', conectar);
  if (depositarBtn) depositarBtn.addEventListener('click', depositar);
  if (sacarBtn) sacarBtn.addEventListener('click', sacar);
  if (atualizarBtn) atualizarBtn.addEventListener('click', atualizarInformacoesBanco);
  if (atualizarCapBtn) atualizarCapBtn.addEventListener('click', atualizarLimiteBanco);

  // Verificar se MetaMask está disponível na inicialização
  verificarMetaMask();

  // Atualizar informações do contrato
  atualizarInfoContrato();

  // Detectar mudanças de conta na MetaMask
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('Contas alteradas:', accounts);
      if (accounts.length === 0) {
        mostrarToastAviso('MetaMask desconectada. Por favor, conecte novamente.');
        resetarInterface();
      } else {
        mostrarToastAviso('Conta alterada. Reconectando...');
        conectar();
      }
    });

    window.ethereum.on('chainChanged', function (chainId) {
      console.log('Rede alterada:', chainId);
      mostrarToastAviso('Rede alterada. A página será recarregada.');
      window.location.reload();
    });
  }
});

// Função para verificar se MetaMask está disponível
function verificarMetaMask() {
  const conectarBtn = document.getElementById("btn-conectar");

  if (typeof window.ethereum === 'undefined') {
    if (conectarBtn) {
      conectarBtn.textContent = "Instalar MetaMask";
      conectarBtn.style.backgroundColor = "#dc3545";
      conectarBtn.onclick = function () {
        window.open('https://metamask.io/download/', '_blank');
      };
    }

    // Mostrar aviso na página
    const aviso = document.createElement('div');
    aviso.innerHTML = `
      <div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border-radius: 4px; border: 1px solid #f5c6cb;">
        <strong>⚠️ MetaMask não detectada!</strong><br>
        Por favor, instale a extensão MetaMask para usar esta aplicação.
        <br><br>
        <a href="https://metamask.io/download/" target="_blank" style="color: #721c24; text-decoration: underline;">
          Clique aqui para baixar MetaMask
        </a>
      </div>
    `;
    document.body.insertBefore(aviso, document.body.firstChild);
  }
}

// Função para resetar interface quando desconectar
function resetarInterface() {
  const conectarBtn = document.getElementById("btn-conectar");
  if (conectarBtn) {
    conectarBtn.textContent = "Conectar MetaMask";
    conectarBtn.style.backgroundColor = "#007bff";
    conectarBtn.disabled = false;
  }

  // Esconder seção de operações
  document.getElementById("secao-operacoes").style.display = "none";

  // Limpar status
  document.getElementById("status-transacao").style.display = "none";

  // Limpar dados
  provider = null;
  signer = null;
  contrato = null;
}

// Função para mostrar toast de aviso
/**
 * Exibe uma notificação estilo toast na tela
 * @param {string} mensagem - A mensagem a ser exibida no toast
 * @param {string} tipo - O tipo de toast: 'success', 'error', 'warning' ou 'info'
 */
function mostrarToastAviso(mensagem, tipo) {
  // Criar elemento do toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  // Criar ícone baseado no tipo
  const icone = document.createElement('span');
  if (tipo === 'success') {
    icone.innerHTML = '✅';
  } else if (tipo === 'error') {
    icone.innerHTML = '❌';
  } else if (tipo === 'warning') {
    icone.innerHTML = '⚠️';
  } else {
    icone.innerHTML = 'ℹ️';
  }
  icone.style.marginRight = '10px';
  icone.style.fontSize = '18px';

  // Criar elemento para mensagem
  const mensagemElem = document.createElement('span');
  mensagemElem.textContent = mensagem;

  // Adicionar conteúdo ao toast
  toast.appendChild(icone);
  toast.appendChild(mensagemElem);

  // Botão para fechar o toast
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.style.marginLeft = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.float = 'right';
  closeButton.onclick = () => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 500);
  };
  toast.appendChild(closeButton);

  // Estilos básicos para o toast
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.padding = '15px 20px';
  toast.style.borderRadius = '10px';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
  toast.style.fontWeight = '500';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.minWidth = '300px';
  toast.style.maxWidth = '80%';

  // Cores baseadas no tipo
  if (tipo === 'success') {
    toast.style.backgroundColor = '#e0f7e6';
    toast.style.color = '#1e7e34';
    toast.style.borderLeft = '5px solid #28a745';
  } else if (tipo === 'error') {
    toast.style.backgroundColor = '#f8d7da';
    toast.style.color = '#b02a37';
    toast.style.borderLeft = '5px solid #dc3545';
  } else if (tipo === 'warning') {
    toast.style.backgroundColor = '#fff3cd';
    toast.style.color = '#997404';
    toast.style.borderLeft = '5px solid #ffc107';
  } else {
    toast.style.backgroundColor = '#cfe2ff';
    toast.style.color = '#084298';
    toast.style.borderLeft = '5px solid #0d6efd';
  }

  // Adicionar animação de entrada e saída
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(50px)';
  toast.style.transition = 'all 0.5s ease-out';

  document.body.appendChild(toast);

  // Aguardar um tempo e remover o toast
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
  }, 5000);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 5500);
}

// Função para atualizar o limite do banco (bankCap)
async function atualizarLimiteBanco() {
  try {
    if (!contrato) {
      mostrarToastAviso("Por favor, conecte sua carteira primeiro!");
      return;
    }

    // Verificar se está na rede correta antes de prosseguir
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      mostrarToastAviso(`Erro: Você está na rede ${network.name} (Chain ID: ${network.chainId})\nPor favor, conecte à rede Sepolia (Chain ID: 11155111)`);
      return;
    }

    // Verificar se é o proprietário do contrato
    const owner = await contrato.owner();
    const currentAddress = await signer.getAddress();

    if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
      mostrarToastAviso("Apenas o proprietário do contrato pode atualizar o limite do banco!", "warning");
      return;
    }

    // Pegar o valor do novo limite
    const novoValorString = document.getElementById("novo-limite").value;
    if (!novoValorString || parseFloat(novoValorString) <= 0) {
      mostrarToastAviso("Por favor, insira um valor válido maior que zero para o novo limite!");
      return;
    }

    // Converter para wei (a menor unidade do Ethereum)
    const novoValor = ethers.parseEther(novoValorString);
    console.log("Atualizando limite do banco para:", ethers.formatEther(novoValor), "ETH");

    // Mostrar loading
    const atualizarCapBtn = document.getElementById("btn-atualizar-cap");
    mostrarLoader(true, atualizarCapBtn, "Atualizando...");

    // Enviar transação
    const tx = await contrato.updateBankCap(novoValor);
    console.log("Transação enviada:", tx.hash);

    document.getElementById("status-transacao").textContent = `Atualização de limite em processamento... Hash: ${tx.hash}`;
    document.getElementById("status-transacao").style.display = "block";

    // Mostrar loader global durante confirmação
    mostrarLoader(true, null, "Confirmando transação na blockchain...");

    // Aguardar confirmação da transação
    await tx.wait();
    // Esconder loader global
    mostrarLoader(false);

    // Atualizar interface
    await atualizarInformacoesBanco();

    document.getElementById("status-transacao").textContent = "Limite do banco atualizado com sucesso!";
    document.getElementById("status-transacao").style.backgroundColor = "#d4edda";
    document.getElementById("novo-limite").value = "";

    // Mostrar toast de sucesso
    mostrarToastAviso(`Limite do banco atualizado para ${formatarETH(novoValor)} com sucesso!`, "success");

    // Restaurar botão
    mostrarLoader(false, atualizarCapBtn);

  } catch (error) {
    console.error("Erro ao atualizar limite do banco:", error);

    // Restaurar botão em caso de erro
    const atualizarCapBtn = document.getElementById("btn-atualizar-cap");
    mostrarLoader(false, atualizarCapBtn);

    document.getElementById("status-transacao").textContent = `Erro na atualização: ${error.message || "Erro desconhecido"}`;
    document.getElementById("status-transacao").style.backgroundColor = "#f8d7da";
    document.getElementById("status-transacao").style.display = "block";

    if (error.code === 4001) {
      mostrarToastAviso("Transação rejeitada pelo usuário", "warning");
    } else {
      mostrarToastAviso(`Erro ao atualizar limite: ${error.message || "Erro desconhecido"}`, "error");
      mostrarToastAviso(`Erro ao atualizar limite do banco: ${error.message || "Erro desconhecido"}`);
    }
  }
}
