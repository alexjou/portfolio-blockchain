let signer;
let cliente;
const clienteAddress = "0xdA07Bf97094352a737a68d82a6B7Dc1bB98752E7";
const clienteAbi = []
window.onload = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    awaitprovider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    cliente = new ethers.Contract(clienteAddress, clienteAbi, signer);
  } else {
    alert("MetaMask não detectado.");
  }
};
async function enviarDeposito() {
  const valorETH = document.getElementById("valor").value;
  const tx = await cliente.enviarDeposito({ value: ethers.parseEther(valorETH) });
  await tx.wait();
  document.getElementById("resultado").innerText = `Deposito confirmado!`;
}
async function verSaldo() {
  const saldo = await cliente.verMeuSaldo();
  document.getElementById("resultado").innerText = ` Saldo atual: 
${ethers.formatEther(saldo)} ETH`;
}
async function requisitarSaque() {
  const valorETH = document.getElementById("valor").value;
  const tx = await cliente.requisitarSaque(ethers.parseEther(valorETH));
  await tx.wait();
  document.getElementById("resultado").innerText = `Saque solicitado!`;
}