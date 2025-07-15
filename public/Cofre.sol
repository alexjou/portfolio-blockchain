// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./InterfaceICofre.sol";

contract Cofre is ICofre {
    mapping(address => uint256) public creditos; // Saldos por endereço
    event Deposito(address indexed de, uint256 valor);
    event Saque(address indexed para, uint valor);

    // Construtor vazio. O Cofre é público e não tem configurações iniciais de permissão.
    constructor() {} 

    // Qualquer um pode depositar. O Cofre registra para o msg.sender (quem o chamou).
    function depositar() external payable {
        require(msg.value > 0, "Envie algum Ether");
        creditos[msg.sender] += msg.value; 
        emit Deposito(msg.sender, msg.value);
    }

    // Qualquer um pode consultar o saldo de qualquer endereço.
    function consultarSaldo(address usuario) external view returns (uint256) {
        return creditos[usuario];
    }

    // Qualquer um pode sacar do SEU PRÓPRIO saldo no Cofre.
    function sacar(uint256 valor) external {
        require(creditos[msg.sender] >= valor, "Saldo insuficiente");
        creditos[msg.sender] -= valor;
        (bool success, ) = payable(msg.sender).call{value: valor}("");
        require(success, "Transferencia falhou...");
        emit Saque(msg.sender, valor);
    }
}