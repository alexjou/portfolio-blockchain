import axios from 'axios';

const BASE_URL = 'https://api-sepolia.etherscan.io/api';
const API_KEY = 'HMDNZBIA98VS37ZFP826N7EK4FXCG7I7BB';

// Busca eventos do contrato (logs)
export async function getContractEvents(address: string): Promise<any[]> {
  let url = `${BASE_URL}?module=logs&action=getLogs&address=${address}&fromBlock=0&toBlock=latest`;
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

// Busca eventos do contrato com filtro de topics e decodificação básica
export async function getContractEventsWithTopics(address: string, topics: string[] = []): Promise<any[]> {
  let url = `${BASE_URL}?module=logs&action=getLogs&address=${address}&fromBlock=0&toBlock=latest`;
  topics.forEach((topic, i) => {
    if (topic) url += `&topic${i}=${topic}`;
  });
  if (API_KEY) url += `&apikey=${API_KEY}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    if (data.status !== "1" || !data.result) return [];
    // Decodificação básica: retorna os dados brutos, mas pode ser melhorado para decodificar valores
    return data.result;
  } catch {
    return [];
  }
}
