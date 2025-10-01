const API_BASE_URL = 'https://pocketbase-production-a9f3.up.railway.app/api/collections/token/records';

export interface APIToken {
  id: string;
  collectionId: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  uri: string;
  supply: number;
  on_chain: {
    mint: string;
    name: string;
    symbol: string;
    updateAuthority: string;
    uri: string;
  };
  off_chain: {
    attributes: unknown[];
    description: string;
    image: string;
    name: string;
    symbol: string;
  };
  kols_count: number;
  first_kol_buy: string;
  last_kol_buy: string;
  kol_buyers: Array<{
    name: string;
    wallet_address: string;
    twitter: string;
    profile_image: string;
    avg_buy_price: number;
    avg_sell_price: number;
    avg_hold_time_seconds: number;
    first_buy_at: string;
    last_action: 'buy' | 'sell';
    position_status: 'holding' | 'fully_sold';
    realized_pnl_percent: number;
    realized_pnl_sol: number;
    total_buys: number;
    total_sells: number;
    total_volume_sol: number;
  }>;
  token_address: string;
  created: string;
  updated: string;
  fetched_at: string;
}

export interface APIResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: APIToken[];
}

export class APIClient {
  private static instance: APIClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  async fetchTokens(page: number = 1, perPage: number = 10000): Promise<APIResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      sort: '-created',
      fields: 'id,collectionId,name,symbol,decimals,image_url,uri,supply,on_chain,off_chain,kols_count,first_kol_buy,last_kol_buy,kol_buyers,token_address,created,updated,fetched_at'
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchAllTokens(): Promise<APIToken[]> {
    const allTokens: APIToken[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.fetchTokens(page, 10000);
        allTokens.push(...response.items);
        
        hasMore = page < response.totalPages;
        page++;
        
        // Add a small delay to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break;
      }
    }

    return allTokens;
  }

  async fetchTokenByAddress(tokenAddress: string): Promise<APIToken | null> {
    const params = new URLSearchParams({
      filter: `token_address="${tokenAddress}"`,
      perPage: '1'
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items.length > 0 ? data.items[0] : null;
  }
}

export default APIClient.getInstance();
