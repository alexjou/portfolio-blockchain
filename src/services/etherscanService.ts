import axios from 'axios';

const BASE_URL = 'https://api.etherscan.io/v2/api';
const API_KEY = 'HMDNZBIA98VS37ZFP826N7EK4FXCG7I7BB';

// Busca transações internas usando o endpoint v2 (novo padrão)
// Sepolia: chainid=11155111, Ethereum Mainnet: 1, Goerli: 5, etc.
export async function getInternalTxs(address: string, chainid: number = 11155111, page: number = 1, offset: number = 1000, sort: 'asc' | 'desc' = 'desc'): Promise<any[]> {
  let url = `${BASE_URL}?chainid=${chainid}&module=account&action=txlistinternal&address=${address}&page=${page}&offset=${offset}&sort=${sort}`;
  if (API_KEY) url += `&apikey=${API_KEY}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    if (!data.result) return [];
    return data.result;
  } catch {
    return [];
  }
}

export async function getUniqueSenders(address: string, contratoCliente?: string, chainid: number = 11155111): Promise<string[]> {
  const txs = await getInternalTxs(address, chainid);
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
// Busca eventos (logs) do contrato, com filtro opcional de topics, usando v2 (novo padrão)
export async function getContractEvents(address: string, chainid: number = 11155111, topics: string[] = [], page: number = 1, offset: number = 1000, sort: 'asc' | 'desc' = 'desc'): Promise<any[]> {
  let url = `${BASE_URL}?chainid=${chainid}&module=logs&action=getLogs&address=${address}&fromBlock=0&toBlock=latest&page=${page}&offset=${offset}&sort=${sort}`;
  topics.forEach((topic, i) => {
    if (topic) url += `&topic${i}=${topic}`;
  });
  if (API_KEY) url += `&apikey=${API_KEY}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    if (!data.result) return [];
    return data.result;
  } catch {
    return [];
  }
}