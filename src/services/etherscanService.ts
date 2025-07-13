import axios from 'axios';

const BASE_URL = 'https://api-sepolia.etherscan.io/api';
const API_KEY = 'HMDNZBIA98VS37ZFP826N7EK4FXCG7I7BB';

export async function getInternalTxs(address: string): Promise<any[]> {
  let url = `${BASE_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=desc`;
  if (API_KEY) url += `&apikey=${API_KEY}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    if (data.status !== "1" || !data.result) return [];
    return data.result;
  } catch {
    return [];
  }
}

export async function getUniqueSenders(address: string, contratoCliente?: string): Promise<string[]> {
  const txs = await getInternalTxs(address);
  let uniqueFroms = Array.from(new Set(
    txs
      .map((tx: any) => typeof tx.from === 'string' ? tx.from : '')
      .filter((addr: string) => !!addr)
  )) as string[];
  if (contratoCliente && !uniqueFroms.includes(contratoCliente)) {
    uniqueFroms = [contratoCliente, ...uniqueFroms];
  }
  return uniqueFroms;
}
