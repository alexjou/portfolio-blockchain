// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./InterfaceICofre.sol";

contract Cliente {
    address public cofreEndereco;
    address public owner; // O owner do contrato Cliente

    // Eventos para rastrear as ações do owner do Cliente
    event DepositoDoOwner(address indexed ownerAddr, uint256 valor);
    event SaqueDoOwner(address indexed ownerAddr, uint256 valor);

    // Construtor do Cliente: define o Cofre e o owner do Cliente
    constructor(address _cofre) {
        require(_cofre != address(0), "Endereco do Cofre nao pode ser zero");
        cofreEndereco = _cofre;
        owner = msg.sender; // Quem fez o deploy do Cliente é o owner
    }

    // Modifier para garantir que apenas o owner do Cliente pode chamar certas funções
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner of this client contract can call this function");
        _;
    }

    // `receive()` é fundamental para que o Cliente possa receber Ether
    // Quando o owner deposita no Cliente, ou quando o Cliente saca do Cofre para si mesmo,
    // o Ether vai para o Cliente.
    receive() external payable {} 

    // Função para o owner do Cliente depositar Ether no Cofre.
    // O saldo será registrado no Cofre para o ENDEREÇO DO CONTRATO CLIENTE.
    function depositar() external payable onlyOwner { // Apenas o owner do Cliente pode depositar para o pool
        require(msg.value > 0, "Precisa enviar algum Ether");
        
        // O Cliente chama o Cofre.depositar(). O Cofre verá o msg.sender como address(this) (o Cliente).
        ICofre(cofreEndereco).depositar{value: msg.value}();
        
        emit DepositoDoOwner(msg.sender, msg.value);
    }

    // Função para o owner do Cliente consultar o saldo do CLIENTE no Cofre.
    function consultarMeuSaldoNoCofre() external view onlyOwner returns (uint256) {
        // O Cofre guarda o saldo do endereço do Cliente, pois o Cliente foi quem depositou.
        return ICofre(cofreEndereco).consultarSaldo(address(this));
    }

    // Função para o owner do Cliente sacar o saldo DO CLIENTE no Cofre.
    // O Cliente saca do Cofre e repassa para o owner.
    function sacar(uint256 valor) external onlyOwner { // Apenas o owner do Cliente pode sacar do pool
        require(valor > 0, "Valor do saque deve ser maior que zero");
        
        ICofre cofre = ICofre(cofreEndereco);

        // 1. O Cliente tenta sacar do Cofre. O Cofre verificará o saldo do CLIENTE
        // e enviará o Ether para o CLIENTE.
        cofre.sacar(valor); 
        
        // 2. Agora o Cliente precisa ter esse Ether (que acabou de receber do Cofre)
        // para repassar para o owner.
        require(address(this).balance >= valor, "Cliente nao tem Ether suficiente para repassar do Cofre");

        // 3. O Cliente envia o Ether para o owner
        (bool success, ) = payable(owner).call{value: valor}("");
        require(success, "Repasse do Cliente para o owner falhou!");
        
        emit SaqueDoOwner(owner, valor);
    }
}