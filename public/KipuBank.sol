// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title KipuBank
 * @dev Contrato de banco digital simples na blockchain Ethereum.
 * Permite depósitos, saques e controle de limite (cap) pelo proprietário.
 */
contract KipuBank {
    // Endereço do proprietário do contrato
    address public owner;

    // Limite máximo de ETH que o banco pode armazenar
    uint256 public bankCap;

    // Total de depósitos realizados no banco
    uint256 public totalDeposits;

    // Mapeamento de saldos dos usuários
    mapping(address => uint256) public userBalances;

    // Eventos para registrar operações
    event Deposit(address indexed user, uint256 amount, uint256 balance);
    event Withdrawal(address indexed user, uint256 amount, uint256 balance);
    event FailedDeposit(address indexed user, uint256 amount, string reason);
    event FailedWithdrawal(address indexed user, uint256 amount, string reason);

    /**
     * @dev Construtor: define o limite máximo do banco e o proprietário.
     * @param _bankCap Limite máximo do banco em wei.
     * Exemplo: Para 1 ETH, use 1000000000000000000.
     */
    constructor(uint256 _bankCap) {
        owner = msg.sender;
        bankCap = _bankCap;
    }

    /**
     * @dev Modificador que restringe funções ao proprietário.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o dono pode executar esta acao");
        _;
    }

    /**
     * @dev Permite ao usuário depositar ETH no banco.
     * Verifica limite e registra evento.
     */
    function deposit() external payable {
        require(msg.value > 0, "O valor depositado deve ser maior que zero");
        // Verifica se o depósito excede o limite do banco
        if (totalDeposits + msg.value > bankCap) {
            emit FailedDeposit(
                msg.sender,
                msg.value,
                "Deposito excede o limite do banco"
            );
            revert("Deposito excede o limite do banco");
        }
        // Atualiza saldo do usuário e total do banco
        userBalances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value, userBalances[msg.sender]);
    }

    /**
     * @dev Permite ao usuário sacar ETH do banco.
     * Verifica saldo e registra evento.
     * @param amount Valor a ser sacado em wei.
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "O valor do saque deve ser maior que zero");
        // Verifica se o usuário tem saldo suficiente
        if (userBalances[msg.sender] < amount) {
            emit FailedWithdrawal(msg.sender, amount, "Saldo insuficiente");
            revert("Saldo insuficiente para saque");
        }
        // Atualiza saldo do usuário e total do banco
        userBalances[msg.sender] -= amount;
        totalDeposits -= amount;
        // Transfere fundos para o usuário
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Falha na transferencia ETH");
        emit Withdrawal(msg.sender, amount, userBalances[msg.sender]);
    }

    /**
     * @dev Retorna o saldo do usuário que chamou a função.
     */
    function getUserBalance() external view returns (uint256) {
        return userBalances[msg.sender];
    }

    /**
     * @dev Retorna o saldo total do banco.
     */
    function getBankBalance() external view returns (uint256) {
        return totalDeposits;
    }

    /**
     * @dev Retorna o limite máximo do banco.
     */
    function getBankCap() external view returns (uint256) {
        return bankCap;
    }

    /**
     * @dev Permite ao proprietário atualizar o limite do banco.
     * @param newCap Novo limite em wei.
     */
    function updateBankCap(uint256 newCap) external onlyOwner {
        bankCap = newCap;
    }
}
