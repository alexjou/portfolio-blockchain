// SPDX-License-Identifier: MIT 
// Licença do código
pragma solidity ^0.8.30; // Versão mínima do compilador

contract SeedGuard {
    // Início do contrato
    // Estrutura que representa um usuário
    struct Usuario {
        address endereco; // Endereço do usuário
        string mensagem; // Mensagem guardada pelo usuário
    }

    // Mapeamento de endereço para dados do usuário
    mapping(address => Usuario) private usuarios;

    constructor() {} // Construtor padrão (não faz nada)

    // Função para guardar uma mensagem na blockchain
    function guardarMensagem(string memory mens) public returns (bool sucesso) {
        Usuario memory u = Usuario(msg.sender, mens); // Cria struct com remetente e mensagem
        usuarios[msg.sender] = u; // Salva no mapeamento usando o endereço do remetente
        return true; // Retorna sucesso
    }

    // Função para ler a mensagem guardada pelo remetente
    function lerMensagem() public view returns (string memory) {
        return usuarios[msg.sender].mensagem; // Retorna a mensagem do usuário
    }
} // Fim do contrato
