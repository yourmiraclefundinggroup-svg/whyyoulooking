import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Plaid configuration
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export interface PlaidBankConnection {
  userId: number;
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  accountIds: string[];
  isActive: boolean;
  lastSync: Date;
}

export class PlaidService {
  async createLinkToken(userId: number) {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: {
          client_user_id: userId.toString(),
        },
        client_name: 'CreditFix Pro',
        products: ['auth', 'transactions', 'assets'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.BASE_URL}/api/plaid/webhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings']
          }
        }
      });

      return response.data.link_token;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw new Error('Failed to create bank connection token');
    }
  }

  async exchangePublicToken(publicToken: string, userId: number) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const { access_token, item_id } = response.data;

      // Get institution info
      const itemResponse = await plaidClient.itemGet({
        access_token: access_token,
      });

      const institution = await plaidClient.institutionsGetById({
        institution_id: itemResponse.data.item.institution_id!,
        country_codes: ['US'],
      });

      // Get accounts
      const accountsResponse = await plaidClient.accountsGet({
        access_token: access_token,
      });

      return {
        accessToken: access_token,
        itemId: item_id,
        institutionId: itemResponse.data.item.institution_id!,
        institutionName: institution.data.institution.name,
        accounts: accountsResponse.data.accounts,
      };
    } catch (error) {
      console.error('Error exchanging Plaid public token:', error);
      throw new Error('Failed to connect bank account');
    }
  }

  async getAccountBalances(accessToken: string) {
    try {
      const response = await plaidClient.accountsBalanceGet({
        access_token: accessToken,
      });

      return response.data.accounts.map(account => ({
        accountId: account.account_id,
        accountName: account.name,
        accountType: account.subtype,
        currentBalance: account.balances.current,
        availableBalance: account.balances.available,
        institutionName: account.official_name || account.name,
      }));
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw new Error('Failed to fetch account balances');
    }
  }

  async getTransactions(accessToken: string, startDate: Date, endDate: Date) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        count: 500,
      });

      return response.data.transactions.map(transaction => ({
        transactionId: transaction.transaction_id,
        accountId: transaction.account_id,
        amount: transaction.amount,
        date: transaction.date,
        name: transaction.name,
        merchantName: transaction.merchant_name,
        category: transaction.category,
        subcategory: transaction.personal_finance_category?.primary,
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  async verifyMicroDeposits(accessToken: string, amounts: number[]) {
    try {
      const response = await plaidClient.authMicroDepositVerify({
        access_token: accessToken,
        amounts: amounts,
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying micro deposits:', error);
      throw new Error('Failed to verify micro deposits');
    }
  }
}

export const plaidService = new PlaidService();