import { createAdminClient } from '@/lib/supabase/admin';
import { Wallet, WalletTransaction, WalletTxType } from '@/types';

/**
 * Consulta el saldo actual del monedero de un usuario
 */
export async function getUserWallet(userId: string): Promise<Wallet | null> {
  try {
    const supabase = createAdminClient();
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Crear billetera vacía si no existe
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0.00, held_balance: 0.00 })
        .select('*')
        .single();

      return newWallet as Wallet;
    }

    return wallet as Wallet;
  } catch (e) {
    console.error('Error al obtener billetera de usuario:', e);
    return null;
  }
}

/**
 * Ajusta de manera atómica e inmutable el saldo del monedero
 */
export async function adjustWalletBalance(params: {
  userId: string;
  amount: number;
  type: WalletTxType;
  description: string;
  performedBy?: string;
  orderId?: string;
}): Promise<{ success: boolean; newBalance?: number; message?: string }> {
  try {
    const supabase = createAdminClient();

    // Obtener billetera actual
    let wallet = await getUserWallet(params.userId);
    if (!wallet) {
      return { success: false, message: 'Billetera no encontrada' };
    }

    let newBalance = wallet.balance;

    if (['ADMIN_CREDIT', 'REFUND', 'BONUS', 'RELEASE'].includes(params.type)) {
      newBalance += Math.abs(params.amount);
    } else if (['ADMIN_DEBIT', 'PURCHASE', 'HOLD', 'ADJUSTMENT'].includes(params.type)) {
      if (wallet.balance < Math.abs(params.amount) && params.type === 'PURCHASE') {
        return { success: false, message: 'Saldo en créditos insuficiente para completar esta compra' };
      }
      newBalance -= Math.abs(params.amount);
    }

    // Actualizar balance de billetera
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error al actualizar balance:', updateError);
      return { success: false, message: 'Error al actualizar saldo' };
    }

    // Registrar transacción inmutable
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      type: params.type,
      amount: params.amount,
      description: params.description,
      performed_by: params.performedBy || null,
      order_id: params.orderId || null,
    });

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error('Error en transacción de créditos:', error);
    return { success: false, message: 'Error interno en servicio de créditos' };
  }
}

/**
 * Obtiene el historial de transacciones de la billetera
 */
export async function getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
  try {
    const supabase = createAdminClient();
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });

    if (error || !transactions) return [];
    return transactions as WalletTransaction[];
  } catch (e) {
    console.error('Error al obtener transacciones:', e);
    return [];
  }
}
