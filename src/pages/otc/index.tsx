import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useToast } from '../../contexts/ToastContext';
import { useWalletContext } from '../../contexts/WalletContext';
import { SOLANA_RPC_URL } from '../../config/program';
import WalletGuard from "../../components/WalletGuard";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { otcApi, tokenApi } from '../patron/services/apiService';



interface OTCOrder {
  orderId: string;
  seller: string;
  amount: string;
  price: string;
  isActive: boolean;
  createdAt: string;
  buyerRestrictions: {
    patronsOnly: boolean;
    treasuryOnly: boolean;
    minPatronScore: number;
  };
}

const OTCTrading: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const { publicKey, connected } = useWalletContext();
  
  // Create connection with proper configuration
  const connection = new Connection(SOLANA_RPC_URL, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
  const [orders, setOrders] = useState<OTCOrder[]>([]);
  const [myOrders, setMyOrders] = useState<OTCOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [createOrderForm, setCreateOrderForm] = useState({
    amount: '',
    price: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchOrders();
      fetchMyOrders();
    }
  }, [publicKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await otcApi.getActiveSwaps();

      if (result.success && result.data) {
        const activeOrders = result.data.map((swap: any) => ({
          orderId: swap.id,
          seller: swap.seller,
          amount: swap.token_amount.toString(),
          price: (swap.sol_rate / 1_000_000_000).toString(), // Convert lamports to SOL
          isActive: swap.status === 'active',
          createdAt: new Date(swap.created_at).toLocaleString(),
          buyerRestrictions: {
            patronsOnly: false,
            treasuryOnly: false,
            minPatronScore: 0,
          },
        }));

        setOrders(activeOrders);
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to fetch OTC orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      console.log('🔍 Fetching my orders...');
      const result = await otcApi.getMySwaps();
      console.log('🔍 My orders result:', result);

      if (result.success && result.data) {
        const myActiveOrders = result.data.map((swap: any) => ({
          orderId: swap.id,
          seller: publicKey?.toString() || '',
          amount: swap.token_amount.toString(),
          price: (swap.sol_rate / 1_000_000_000).toString(), // Convert lamports to SOL
          isActive: swap.status === 'active',
          createdAt: new Date(swap.created_at).toLocaleString(),
          buyerRestrictions: {
            patronsOnly: false,
            treasuryOnly: false,
            minPatronScore: 0,
          },
        }));

        console.log('🔍 Processed my orders:', myActiveOrders);
        setMyOrders(myActiveOrders);
      } else {
        console.log('❌ Failed to fetch my orders:', result.error);
        throw new Error(result.error || 'Failed to fetch my orders');
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
      showError('Failed to fetch your OTC orders');
    }
  };

  const createOrder = async () => {
    if (!connected || !publicKey) {
      showError('Please connect your wallet first');
      return;
    }

    if (!createOrderForm.amount || !createOrderForm.price) {
      showError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(createOrderForm.amount);
    const price = parseFloat(createOrderForm.price);

    if (amount <= 0 || price <= 0) {
      showError('Amount and price must be greater than 0');
      return;
    }

    if (price > 1) {
      showError('Price seems high. Please enter price in SOL (e.g., 0.001 for 0.001 SOL per token)');
      return;
    }

    try {
      setLoading(true);
      showInfo('Creating OTC swap order...');

      const swapData = {
        token_amount: amount,
        sol_rate: Math.floor(price * 1_000_000_000), // Convert SOL to lamports
        buyer_rebate: 0,
        buyer_role_required: 'none', // Anyone can buy
      };
      
      console.log('📤 Sending swap data:', swapData);
      let result = await otcApi.initiateSwap(swapData);
      console.log('📥 Swap creation result:', result);

      // Check if we need to initialize user claim account first
      if (!result.success && result.error && 
          (result.error.includes('AccountNotInitialized') || 
           result.error.includes('0xbc4') || 
           result.error.includes('seller_claim'))) {
        console.log('🔧 User claim account not found, initializing...');
        showInfo('Setting up your account for the first time...');
        
        try {
          const initResult = await tokenApi.initializeUserClaim();
          
          if (initResult.success && initResult.data) {
            showInfo('Please approve the account setup transaction in your wallet...');
            
            // Decode and sign the initialization transaction
            const initTxBytes = Uint8Array.from(atob(initResult.data), c => c.charCodeAt(0));
            const initTransaction = Transaction.from(initTxBytes);
            
            // Update with fresh blockhash
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            initTransaction.recentBlockhash = blockhash;
            initTransaction.feePayer = new PublicKey(publicKey);
            
            // Sign and send initialization transaction
            if (typeof window !== 'undefined' && (window as any).solana) {
              const signedInitTx = await (window as any).solana.signTransaction(initTransaction);
              
              showInfo('Submitting account setup transaction...');
              const initSignature = await connection.sendRawTransaction(signedInitTx.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
              });
              
              showInfo('Waiting for account setup confirmation...');
              await connection.confirmTransaction({
                signature: initSignature,
                blockhash: initTransaction.recentBlockhash!,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
              }, 'confirmed');
              
              console.log('✅ User claim account initialized successfully');
              showInfo('Account setup complete. Proceeding with OTC swap creation...');
              
              // Retry the swap creation now that account is initialized
              result = await otcApi.initiateSwap(swapData);
              console.log('📥 Retry swap creation result:', result);
            } else {
              throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
            }
          } else {
            throw new Error(`Failed to initialize user claim account: ${initResult.error}`);
          }
        } catch (initError) {
          console.error('❌ Failed to initialize user claim account:', initError);
          throw new Error(`Failed to set up your account: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
        }
      }

      if (result.success && result.data) {
        // Check if this requires wallet signature
        if ('requiresWalletSignature' in result && result.requiresWalletSignature) {
          showInfo('Please approve the OTC swap creation in your wallet...');
          
          // Decode the base64 transaction
          const transactionBytes = Uint8Array.from(atob(result.data), c => c.charCodeAt(0));
          const transaction = Transaction.from(transactionBytes);
          
          console.log('🔍 Transaction decoded successfully. Fee payer:', transaction.feePayer?.toString());
          console.log('🔍 Original blockhash:', transaction.recentBlockhash);
          
          // Update with fresh blockhash
          showInfo('Getting fresh blockhash for transaction...');
          try {
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new PublicKey(publicKey);
            console.log('🔍 Updated with fresh blockhash:', blockhash);
          } catch (rpcError) {
            console.error('❌ RPC Connection Error:', rpcError);
            throw new Error(`Failed to connect to Solana network. Please check your internet connection and try again.`);
          }
          
          // Sign and send transaction using Phantom wallet
          if (typeof window !== 'undefined' && (window as any).solana) {
            showInfo('Please approve the transaction in your Phantom wallet...');
            
            try {
              const signedTransaction = await (window as any).solana.signTransaction(transaction);
              console.log('✅ Transaction signed by wallet');
              
              showInfo('Submitting transaction to blockchain...');
              const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
              });
              console.log('📤 Transaction submitted with signature:', signature);
              
              showInfo('Waiting for blockchain confirmation...');
              await connection.confirmTransaction({
                signature,
                blockhash: transaction.recentBlockhash!,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
              }, 'confirmed');
              
              console.log('✅ Transaction confirmed on blockchain');
            } catch (txError) {
              console.error('❌ Transaction Error:', txError);
              if (txError instanceof Error && txError.message.includes('User rejected')) {
                throw new Error('Transaction cancelled by user');
              }
              throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
            }
          } else {
            throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
          }
          
          showSuccess('OTC swap order created successfully!');
          setShowCreateForm(false);
          setCreateOrderForm({
            amount: '',
            price: '',
          });
          console.log('🔄 Refreshing orders after successful creation...');
          fetchOrders();
          fetchMyOrders();
        } else {
          // Old behavior for non-transaction responses
          showSuccess('OTC swap order created successfully!');
          setShowCreateForm(false);
          setCreateOrderForm({
            amount: '',
            price: '',
          });
          console.log('🔄 Refreshing orders after successful creation...');
          fetchOrders();
          fetchMyOrders();
        }
      } else {
        throw new Error('error' in result ? result.error : 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = async (order: OTCOrder) => {
    if (!connected || !publicKey) {
      showError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      showInfo(`Accepting OTC swap from ${order.seller.slice(0, 8)}...${order.seller.slice(-8)}...`);

      const result = await otcApi.acceptSwap(order.seller);

      if (result.success) {
        showSuccess('OTC swap executed successfully!');
        fetchOrders();
        fetchMyOrders();
      } else {
        throw new Error(result.error || 'Failed to execute order');
      }
    } catch (error) {
      console.error('Error executing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute order';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!connected || !publicKey) {
      showError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      showInfo('Canceling OTC swap order...');

      const result = await otcApi.cancelSwap();

      if (result.success) {
        showSuccess('OTC swap order canceled successfully!');
        fetchOrders();
        fetchMyOrders();
      } else {
        throw new Error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canBuyOrder = (order: OTCOrder) => {
    // Add logic to check if user meets buying restrictions
    // This would need to fetch user's role and patron score
    return true; // Simplified for now
  };

  return (
    <div className="w-100 p-3" style={{ height: "100vh" }}>
      <div className="d-flex gap-4" style={{ height: "calc(100vh-60px)", paddingTop: '55px' }}>
        {/* Menu Begin */}
        <ResponsiveMenu />
        {/* Menu End */}
        <div className="custom-content" >
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fs-1" style={{ lineHeight: 'normal' }}>🔄 OTC Trading</div>
            </div>
          </div>
          <div className="custom-border-y custom-content-height d-flex flex-column px-3">
            <WalletGuard>
              <div className="container-fluid">
                {!connected && (
                  <div className="alert alert-warning mb-4" role="alert">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                      </div>
                      <div className="ms-3">
                        <h6 className="alert-heading">Wallet Not Connected</h6>
                        <p className="mb-0">Please connect your wallet to view and trade OTC orders.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="card shadow-lg">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn btn-primary"
                        disabled={loading || !connected}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Creating...
                          </>
                        ) : (
                          'Create Order'
                        )}
                      </button>
                    </div>
                    <p className="text-muted mt-2 mb-0">
                      Fixed-price token trading between Sellers and Patrons/Treasury
                    </p>

                    {/* Tabs */}
                    <div className="mt-3">
                      <ul className="nav nav-tabs">
                        <li className="nav-item">
                          <button
                            onClick={() => setActiveTab('all')}
                            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                          >
                            All Orders
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            onClick={() => setActiveTab('my')}
                            className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
                          >
                            My Orders
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {showCreateForm && (
                    <div className="card-body bg-light border-bottom">
                      <h5 className="card-title">📝 Create Sell Order</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">
                            Amount (SNAKE)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={createOrderForm.amount}
                            onChange={(e) => setCreateOrderForm({ ...createOrderForm, amount: e.target.value })}
                            className="form-control"
                            placeholder="e.g., 1000"
                          />
                          <div className="form-text">Number of SNAKE tokens to sell</div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Price per Token (SOL)
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            max="1"
                            value={createOrderForm.price}
                            onChange={(e) => setCreateOrderForm({ ...createOrderForm, price: e.target.value })}
                            className="form-control"
                            placeholder="e.g., 0.001"
                          />
                          <div className="form-text">Price in SOL per SNAKE token (e.g., 0.001 = 0.001 SOL per token)</div>
                        </div>
                      </div>

                      <div className="mt-4 d-flex gap-2">
                        <button
                          onClick={createOrder}
                          disabled={loading || !createOrderForm.amount || !createOrderForm.price}
                          className="btn btn-success"
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Creating...
                            </>
                          ) : (
                            'Create Order'
                          )}
                        </button>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      {activeTab === 'all' ? '📊 All Active Orders' : '📋 My Orders'}
                    </h5>
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading orders...</p>
                      </div>
                    ) : (activeTab === 'all' ? orders : myOrders).length === 0 ? (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <i className="bi bi-inbox fs-1 text-muted"></i>
                        </div>
                        <p className="text-muted">
                          {activeTab === 'all' ? 'No active orders found' : 'You have no active orders'}
                        </p>
                        {activeTab === 'my' && (
                          <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary mt-2"
                            disabled={!connected}
                          >
                            Create Your First Order
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th scope="col">
                                Seller
                              </th>
                              <th scope="col">
                                Amount
                              </th>
                              <th scope="col">
                                Price
                              </th>
                              <th scope="col">
                                Restrictions
                              </th>
                              <th scope="col">
                                Created
                              </th>
                              <th scope="col">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(activeTab === 'all' ? orders : myOrders).map((order) => (
                              <tr key={order.orderId}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                      <i className="bi bi-person-fill text-white small"></i>
                                    </div>
                                    <div>
                                      <div className="fw-bold small">
                                        {order.seller.slice(0, 8)}...{order.seller.slice(-8)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-bold text-success">
                                    {parseFloat(order.amount).toLocaleString()}
                                  </div>
                                  <small className="text-muted">SNAKE</small>
                                </td>
                                <td>
                                  <div className="fw-bold text-warning">
                                    {parseFloat(order.price).toFixed(4)}
                                  </div>
                                  <small className="text-muted">SOL</small>
                                </td>
                                <td>
                                <span className="badge bg-success">✅ Open to All</span>
                                </td>
                                <td>
                                  <small className="text-muted">{order.createdAt}</small>
                                </td>
                                <td>
                                  {activeTab === 'my' ? (
                                    <button
                                      onClick={() => cancelOrder(order.orderId)}
                                      disabled={loading}
                                      className="btn btn-outline-danger btn-sm"
                                    >
                                      {loading ? (
                                        <span className="spinner-border spinner-border-sm" />
                                      ) : (
                                        <>
                                          <i className="bi bi-x-circle me-1"></i>
                                          Cancel
                                        </>
                                      )}
                                    </button>
                                  ) : order.seller === publicKey?.toString() ? (
                                    <span className="badge bg-secondary">Your Order</span>
                                  ) : canBuyOrder(order) ? (
                                    <button
                                      onClick={() => executeOrder(order)}
                                      disabled={loading}
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      {loading ? (
                                        <span className="spinner-border spinner-border-sm" />
                                      ) : (
                                        <>
                                          <i className="bi bi-cart-plus me-1"></i>
                                          Buy
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="badge bg-light text-dark">Not Eligible</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </WalletGuard>
          </div>
        </div>
      </div>
    </div>

  );
};

export default OTCTrading;
