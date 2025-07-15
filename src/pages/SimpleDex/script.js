let signer;
let simpleDex;
let tokenA;
let tokenB;
const simpleDexAddress = "COLOQUE_O_ENDERECO_DO_CONTRATO_AQUI";
const tokenAAddress = "COLOQUE_O_ENDERECO_DO_TOKEN_AQUI";
const tokenBAddress = "COLOQUE_O_ENDERECO_DO_TOKEN_B_AQUI";
const simpleDexAbi = [
  // Adicione o ABI do SimpleDEX aqui
];
const erc20Abi = [
  "function approve(address spender, uint256 amount) public returns (bool)",
];

window.onload = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    simpleDex = new ethers.Contract(simpleDexAddress, simpleDexAbi, signer);
    tokenA = new ethers.Contract(tokenAAddress, erc20Abi, signer);
    tokenB = new ethers.Contract(tokenBAddress, erc20Abi, signer);
  } else {
    alert("MetaMask não detectado.");
  }
};

async function adicionarLiquidez() {
  const amountA = document.getElementById("amountA").value;
  const amountB = document.getElementById("amountB").value;
  // Aprova o SimpleDEX para gastar TokenA
  const txA = await tokenA.approve(simpleDexAddress, ethers.parseUnits(amountA, 18));
  await txA.wait();
  // Aprova o SimpleDEX para gastar TokenB
  const txB = await tokenB.approve(simpleDexAddress, ethers.parseUnits(amountB, 18));
  await txB.wait();
  // Adiciona liquidez
  const tx = await simpleDex.addLiquidity(
    ethers.parseUnits(amountA, 18),
    ethers.parseUnits(amountB, 18)
  );
  await tx.wait();
  document.getElementById("resultado").innerText = `Liquidez adicionada!`;
}

async function removerLiquidez() {
  const amountA = document.getElementById("amountA").value;
  const amountB = document.getElementById("amountB").value;
  const tx = await simpleDex.removeLiquidity(
    ethers.parseUnits(amountA, 18),
    ethers.parseUnits(amountB, 18)
  );
  await tx.wait();
  document.getElementById("resultado").innerText = `Liquidez removida!`;
}

async function swapAforB() {
  const amountAIn = document.getElementById("amountAIn").value;
  const tx = await simpleDex.swapAforB(ethers.parseUnits(amountAIn, 18));
  await tx.wait();
  document.getElementById("resultado").innerText = `Swap realizado!`;
}

async function swapBforA() {
  const amountBIn = document.getElementById("amountBIn").value;
  const tx = await simpleDex.swapBforA(ethers.parseUnits(amountBIn, 18));
  await tx.wait();
  document.getElementById("resultado").innerText = `Swap realizado!`;
}

async function verPreco(tokenAddress) {
  const price = await simpleDex.getPrice(tokenAddress);
  document.getElementById("resultado").innerText = `Preço: ${ethers.formatUnits(price, 18)}`;
}
