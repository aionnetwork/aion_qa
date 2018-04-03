package org.aion;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.Key;
import org.aion.api.type.MsgRsp;
import org.aion.api.type.TxArgs;
import org.aion.base.type.Address;
import org.aion.base.type.Hash256;
import org.aion.base.util.ByteArrayWrapper;

import java.math.BigInteger;
import java.util.List;

public class TransactionGenerator {
    static IAionAPI api;
    static ApiMsg apiMsg;

    //send money transaction continuously between new accounts
    public static void sendContinuousTransaction(IAionAPI api_in, ApiMsg apiMsg_in, int NUM_ACCOUNTS, List<Address> accts, int NUM_TX, String password) {
        api = api_in;
        apiMsg = apiMsg_in;
        for (int j = 0; j < NUM_TX; j++) {
            for (int i = 0; i < NUM_ACCOUNTS / 2; i++) {
                System.out.println();
                Address acct_from = accts.get(i);
                Address acct_to = accts.get(i + NUM_ACCOUNTS / 2);
                System.out.println("transaction " + j + " from account " + i +
                        " " + accts.get(i) + " to: " + accts.get(i + NUM_ACCOUNTS / 2));
                if ((boolean) (api.getWallet().unlockAccount(acct_from, password, 86400).getObject()) == true) {

                    TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                            .data(ByteArrayWrapper.wrap("TestSendTransaction!".getBytes()))
                            .from(acct_from)
                            .to(acct_to)
                            .nrgLimit(100000)
                            .nrgPrice(1)
                            .value(BigInteger.ZERO)
                            .nonce(BigInteger.ZERO);

                    api.getTx().fastTxbuild(builder.createTxArgs());

                    Hash256 hash = ((MsgRsp) api.getTx().sendTransaction(null).getObject()).getTxHash();
                    //System.out.println(hash);
                    System.out.println("txn hash: " + hash);
                    try{
                        Thread.sleep(40000);
                    } catch(Exception e) {
                        System.out.println(e);
                    }

                    if (hash == null || hash.toString().equals("0000000000000000000000000000000000000000000000000000000000000000")) {
                        System.out.println("no valid txn hash");
                        break;
                    }			

                } else {
                    System.out.println("account unlock failed");
                    continue;
                }
            }
        }
    }
}
