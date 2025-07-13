const contratoAddress = "0x907daae5c9bd87398f2423a7389f5013013b6958";
const contratoABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "mens",
        "type": "string"
      }
    ],
    "name": "guardarMensagem",
    "outputs": [
      {
        "internalType": "bool",
        "name": "sucesso",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lerMensagem",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// variáveis padrão
let provider, signer, contrato;

// conexão com a metamask
async function conectar() {
  try {
    // Verificar se MetaMask está instalada
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask não está instalada! Por favor, instale a extensão MetaMask no seu navegador.");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    // Verificar se é realmente MetaMask
    if (!window.ethereum.isMetaMask) {
      alert("Por favor, use a extensão MetaMask oficial.");
      return;
    }

    console.log("Solicitando conexão com MetaMask...");

    // Solicitar acesso às contas
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      alert("Nenhuma conta foi selecionada. Por favor, desbloqueie sua MetaMask e tente novamente.");
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
      alert(`Rede incorreta! Por favor, conecte à rede Sepolia.\nRede atual: ${network.name} (Chain ID: ${network.chainId})\nRede esperada: Sepolia (Chain ID: 11155111)`);
      return;
    }

    // Obter endereço da conta
    const address = await signer.getAddress();
    console.log("Endereço da conta:", address);

    // Verificar se o contrato existe na rede
    const contractCode = await provider.getCode(contratoAddress);
    if (contractCode === '0x') {
      alert(`Contrato não encontrado no endereço ${contratoAddress} na rede Sepolia.\nVerifique se o contrato foi implantado corretamente.`);
      return;
    }

    console.log("Contrato encontrado na rede!");

    // Criar instância do contrato
    contrato = new ethers.Contract(contratoAddress, contratoABI, signer);

    alert(`Carteira conectada com sucesso!\nEndereço: ${address}\nRede: ${network.name} (Chain ID: ${network.chainId})`);

    // Atualizar interface para mostrar status de conexão
    const conectarBtn = document.getElementById("btn-conectar");
    if (conectarBtn) {
      conectarBtn.textContent = "Carteira Conectada ✓";
      conectarBtn.style.backgroundColor = "#28a745";
      conectarBtn.disabled = true;
    }

    // Atualizar informações do contrato na interface
    atualizarInfoContrato();

  } catch (error) {
    console.error("Erro ao conectar com MetaMask:", error);

    // Tratar diferentes tipos de erro
    if (error.code === 4001) {
      alert("Conexão rejeitada pelo usuário. Por favor, aceite a conexão na MetaMask.");
    } else if (error.code === -32002) {
      alert("Solicitação de conexão pendente. Por favor, verifique sua MetaMask.");
    } else if (error.message && error.message.includes("User rejected")) {
      alert("Conexão rejeitada. Por favor, aceite a conexão na MetaMask.");
    } else {
      alert(`Erro ao conectar: ${error.message || "Erro desconhecido. Verifique se a MetaMask está desbloqueada."}`);
    }
  }
}

//funções de contrato (especificadas)
async function guardar() {
  try {
    if (!contrato) {
      alert("Por favor, conecte sua carteira primeiro!");
      return;
    }

    const text = document.getElementById("input-mensagem").value;
    if (!text.trim()) {
      alert("Por favor, digite uma mensagem antes de guardar!");
      return;
    }

    console.log("Enviando mensagem:", text);

    // Verificar se estamos na rede correta antes de enviar
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      alert(`Erro: Você está na rede ${network.name} (Chain ID: ${network.chainId})\nPor favor, conecte à rede Sepolia (Chain ID: 11155111)`);
      return;
    }

    // Mostrar loading
    const guardarBtn = document.getElementById("btn-guardar");
    const originalText = guardarBtn.textContent;
    guardarBtn.textContent = "Guardando...";
    guardarBtn.disabled = true;

    // Verificar saldo antes de enviar transação
    const balance = await provider.getBalance(await signer.getAddress());
    console.log("Saldo da conta:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      alert("Saldo insuficiente! Você precisa de ETH de teste (Sepolia) para enviar transações.\nVisite um faucet de Sepolia para obter ETH de teste.");
      guardarBtn.textContent = originalText;
      guardarBtn.disabled = false;
      return;
    }

    const tx = await contrato.guardarMensagem(text);
    console.log("Transação enviada:", tx.hash);

    alert(`Transação enviada! Hash: ${tx.hash}\nAguardando confirmação...`);

    await tx.wait();
    alert("Mensagem guardada com sucesso!");

    // Limpar input
    document.getElementById("input-mensagem").value = "";

    // Restaurar botão
    guardarBtn.textContent = originalText;
    guardarBtn.disabled = false;

  } catch (error) {
    console.error("Erro ao guardar mensagem:", error);

    // Restaurar botão em caso de erro
    const guardarBtn = document.getElementById("btn-guardar");
    guardarBtn.textContent = "Guardar Mensagem";
    guardarBtn.disabled = false;

    if (error.code === 4001) {
      alert("Transação rejeitada pelo usuário.");
    } else if (error.code === -32602) {
      alert("Erro de RPC: Verifique se você está conectado à rede Sepolia e se o contrato existe nesta rede.");
    } else if (error.message && error.message.includes("insufficient funds")) {
      alert("Saldo insuficiente para executar a transação. Você precisa de ETH de teste (Sepolia).");
    } else if (error.message && error.message.includes("External transactions to internal accounts")) {
      alert("Erro de rede: Você está conectado a uma rede que não suporta contratos inteligentes.\nPor favor, conecte à rede Sepolia.");
    } else if (error.message && error.message.includes("network")) {
      alert("Erro de rede: Verifique sua conexão e se está na rede Sepolia.");
    } else {
      alert(`Erro ao guardar mensagem: ${error.message || "Erro desconhecido"}\nCódigo: ${error.code || "N/A"}`);
    }
  }
}

async function ler() {
  try {
    if (!contrato) {
      alert("Por favor, conecte sua carteira primeiro!");
      return;
    }
    console.log("Lendo mensagem do contrato...");
    // Mostrar loading
    const lerBtn = document.getElementById("btn-ler");
    const originalText = lerBtn.textContent;
    lerBtn.textContent = "Lendo...";
    lerBtn.disabled = true;

    const msg = await contrato.lerMensagem();
    console.log("Mensagem lida:", msg);

    const outputElement = document.getElementById("mensagem-resultado");
    if (msg && msg.trim()) {
      outputElement.textContent = msg;
      outputElement.style.backgroundColor = "#d4edda";
      outputElement.style.color = "#155724";
      alert("Mensagem lida com sucesso!");
    } else {
      outputElement.textContent = "Nenhuma mensagem encontrada ou mensagem vazia.";
      outputElement.style.backgroundColor = "#f8d7da";
      outputElement.style.color = "#721c24";
    }

    // Restaurar botão
    lerBtn.textContent = originalText;
    lerBtn.disabled = false;

  } catch (error) {
    console.error("Erro ao ler mensagem:", error);

    // Restaurar botão em caso de erro
    const lerBtn = document.getElementById("btn-ler");
    lerBtn.textContent = "Ler Mensagem";
    lerBtn.disabled = false;

    const outputElement = document.getElementById("mensagem-resultado");
    outputElement.textContent = `Erro ao ler mensagem: ${error.message || "Erro desconhecido"}`;
    outputElement.style.backgroundColor = "#f8d7da";
    outputElement.style.color = "#721c24";

    alert(`Erro ao ler mensagem: ${error.message || "Erro desconhecido"}`);
  }
}

// Função para atualizar informações do contrato no HTML
function atualizarInfoContrato() {
  const contractLink = document.getElementById("contract-link");
  if (contractLink) {
    contractLink.href = `https://sepolia.etherscan.io/address/${contratoAddress}`;
    contractLink.textContent = contratoAddress;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  const conectarBtn = document.getElementById("btn-conectar");
  const guardarBtn = document.getElementById("btn-guardar");
  const lerBtn = document.getElementById("btn-ler");

  if (conectarBtn) conectarBtn.addEventListener('click', conectar);
  if (guardarBtn) guardarBtn.addEventListener('click', guardar);
  if (lerBtn) lerBtn.addEventListener('click', ler);

  // Verificar se MetaMask está disponível na inicialização
  verificarMetaMask();

  // Atualizar informações do contrato
  atualizarInfoContrato();

  // Detectar mudanças de conta na MetaMask
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('Contas alteradas:', accounts);
      if (accounts.length === 0) {
        alert('MetaMask desconectada. Por favor, conecte novamente.');
        resetarInterface();
      } else {
        alert('Conta alterada. Reconectando...');
        conectar();
      }
    });

    window.ethereum.on('chainChanged', function (chainId) {
      console.log('Rede alterada:', chainId);
      alert('Rede alterada. A página será recarregada.');
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

  // Limpar dados
  provider = null;
  signer = null;
  contrato = null;
}
