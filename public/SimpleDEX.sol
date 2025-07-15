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
        owner = msg.sender;
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(msg.sender == owner, "Only owner");
        require(amountA > 0 && amountB > 0, "Amounts must be > 0");
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external {
        require(msg.sender == owner, "Only owner");
        require(
            amountA <= reserveA && amountB <= reserveB,
            "Insufficient reserves"
        );
        reserveA -= amountA;
        reserveB -= amountB;
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    function swapAforB(uint256 amountAIn) external {
        require(amountAIn > 0, "Amount must be > 0");
        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);
        require(amountBOut <= reserveB, "Insufficient liquidity");
        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        tokenB.transfer(msg.sender, amountBOut);
        reserveA += amountAIn;
        reserveB -= amountBOut;
        emit SwappedAforB(msg.sender, amountAIn, amountBOut);
    }

    function swapBforA(uint256 amountBIn) external {
        require(amountBIn > 0, "Amount must be > 0");
        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);
        require(amountAOut <= reserveA, "Insufficient liquidity");
        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        tokenA.transfer(msg.sender, amountAOut);
        reserveB += amountBIn;
        reserveA -= amountAOut;
        emit SwappedBforA(msg.sender, amountBIn, amountAOut);
    }

    function getPrice(address _token) external view returns (uint256) {
        if (_token == address(tokenA)) {
            return (reserveB * 1e18) / reserveA;
        } else if (_token == address(tokenB)) {
            return (reserveA * 1e18) / reserveB;
        } else {
            revert("Invalid token");
        }
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256) {
        // Fórmula do produto constante: x*y = k
        // amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
        return (amountIn * reserveOut) / (reserveIn + amountIn);
    }
}
