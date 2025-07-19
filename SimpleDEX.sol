// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDEX {
    address public owner;
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB
    );
    event SwappedAforB(
        address indexed user,
        uint256 amountAIn,
        uint256 amountBOut
    );
    event SwappedBforA(
        address indexed user,
        uint256 amountBIn,
        uint256 amountAOut
    );

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "TokenA address cannot be zero");
        require(_tokenB != address(0), "TokenB address cannot be zero");
        require(_tokenA != _tokenB, "Tokens must be different");
        
        owner = msg.sender;
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(msg.sender == owner, "Only owner can add liquidity");
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        
        // Verificar se o contrato tem permissão para transferir os tokens
        require(
            tokenA.allowance(msg.sender, address(this)) >= amountA,
            "Insufficient TokenA allowance"
        );
        require(
            tokenB.allowance(msg.sender, address(this)) >= amountB,
            "Insufficient TokenB allowance"
        );
        
        // Transferir tokens para o contrato
        require(
            tokenA.transferFrom(msg.sender, address(this), amountA),
            "TokenA transfer failed"
        );
        require(
            tokenB.transferFrom(msg.sender, address(this), amountB),
            "TokenB transfer failed"
        );
        
        // Atualizar reservas
        reserveA += amountA;
        reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external {
        require(msg.sender == owner, "Only owner can remove liquidity");
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        require(amountA <= reserveA, "Insufficient TokenA reserves");
        require(amountB <= reserveB, "Insufficient TokenB reserves");
        
        // Atualizar reservas antes de transferir
        reserveA -= amountA;
        reserveB -= amountB;
        
        // Transferir tokens de volta para o owner
        require(
            tokenA.transfer(msg.sender, amountA),
            "TokenA transfer failed"
        );
        require(
            tokenB.transfer(msg.sender, amountB),
            "TokenB transfer failed"
        );
        
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    function swapAforB(uint256 amountAIn) external {
        require(amountAIn > 0, "Amount must be greater than 0");
        require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");
        
        // Verificar se o usuário tem saldo suficiente
        require(
            tokenA.balanceOf(msg.sender) >= amountAIn,
            "Insufficient TokenA balance"
        );
        
        // Verificar se o contrato tem permissão para transferir
        require(
            tokenA.allowance(msg.sender, address(this)) >= amountAIn,
            "Insufficient TokenA allowance"
        );
        
        // Calcular quantidade de saída usando a fórmula do produto constante
        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);
        require(amountBOut > 0, "Insufficient output amount");
        require(amountBOut <= reserveB, "Insufficient TokenB reserves");
        
        // Transferir tokens
        require(
            tokenA.transferFrom(msg.sender, address(this), amountAIn),
            "TokenA transfer failed"
        );
        require(
            tokenB.transfer(msg.sender, amountBOut),
            "TokenB transfer failed"
        );
        
        // Atualizar reservas
        reserveA += amountAIn;
        reserveB -= amountBOut;
        
        emit SwappedAforB(msg.sender, amountAIn, amountBOut);
    }

    function swapBforA(uint256 amountBIn) external {
        require(amountBIn > 0, "Amount must be greater than 0");
        require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");
        
        // Verificar se o usuário tem saldo suficiente
        require(
            tokenB.balanceOf(msg.sender) >= amountBIn,
            "Insufficient TokenB balance"
        );
        
        // Verificar se o contrato tem permissão para transferir
        require(
            tokenB.allowance(msg.sender, address(this)) >= amountBIn,
            "Insufficient TokenB allowance"
        );
        
        // Calcular quantidade de saída usando a fórmula do produto constante
        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);
        require(amountAOut > 0, "Insufficient output amount");
        require(amountAOut <= reserveA, "Insufficient TokenA reserves");
        
        // Transferir tokens
        require(
            tokenB.transferFrom(msg.sender, address(this), amountBIn),
            "TokenB transfer failed"
        );
        require(
            tokenA.transfer(msg.sender, amountAOut),
            "TokenA transfer failed"
        );
        
        // Atualizar reservas
        reserveB += amountBIn;
        reserveA -= amountAOut;
        
        emit SwappedBforA(msg.sender, amountBIn, amountAOut);
    }

    function getPrice(address _token) external view returns (uint256) {
        require(_token == address(tokenA) || _token == address(tokenB), "Invalid token address");
        require(reserveA > 0 && reserveB > 0, "No liquidity");
        
        if (_token == address(tokenA)) {
            // Preço do TokenA em relação ao TokenB
            return (reserveB * 1e18) / reserveA;
        } else {
            // Preço do TokenB em relação ao TokenA
            return (reserveA * 1e18) / reserveB;
        }
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256) {
        // Fórmula do produto constante: (x + dx)(y - dy) = xy
        // Onde: x = reserveIn, y = reserveOut, dx = amountIn, dy = amountOut
        // Resolvendo: dy = (dx * y) / (x + dx)
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient reserves");
        
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        
        require(denominator > reserveIn, "Overflow in denominator");
        require(numerator / denominator > 0, "Insufficient output amount");
        
        return numerator / denominator;
    }
}
