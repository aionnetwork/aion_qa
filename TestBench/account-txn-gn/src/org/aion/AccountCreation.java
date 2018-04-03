package org.aion;

import org.aion.api.IAionAPI;
import org.aion.api.type.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.aion.base.type.Address;
import org.aion.base.type.Hash256;
import org.aion.base.util.ByteArrayWrapper;

public class AccountCreation {
    static IAionAPI api;
    static ApiMsg apiMsg;

    private static String pwd;
    private static List<Address> keyList = new ArrayList<>();
    
    private static FileWriter f;
    static BufferedWriter output;
    static File accounts;

    private static BigInteger amountToTransfer = BigInteger.valueOf(1000L);

    public static List<Address> init(IAionAPI api_in, ApiMsg apiMsg_in, String account, int NUM_ACCOUNTS, File txt, String password) throws InterruptedException {

        accounts = txt;
        //genesisAccounts.add(gen_account);
        pwd = password;

        api = api_in;
        apiMsg = apiMsg_in;
        try {
            f = new FileWriter(accounts, false);
            output = new BufferedWriter(f);

        } catch (Exception e) {
            e.printStackTrace();
        }

        for (int i = 0; i < NUM_ACCOUNTS; i++) {
            createAccount();
            System.out.println("newly created account " + i + ": " + keyList.get(i));
            transferAmount(Address.wrap(account), keyList.get(i), password);
        }

        ApiMsg msg = api.getAdmin().getBlocksByLatest(1L);
        Block blk = ((List<Block>) msg.getObject()).get(0);
        Long target = blk.getNumber() + 6;

        while (blk.getNumber() < target) {
            Thread.sleep(5000);
            System.out.println("generated " + blk.getNumber());
            msg = api.getAdmin().getBlocksByLatest(1L);
            blk = ((List<Block>) msg.getObject()).get(0);
        }

        for (int i = 0; i < NUM_ACCOUNTS; i++) {
            BigInteger balance = api.getChain().getBalance(keyList.get(i)).getObject();
            if (balance.compareTo(amountToTransfer) != 0) {
                System.out.println("balance for account " + keyList.get(i).toString() + " does not match");
                System.out.println("current balance: " + balance);
            } else {
                System.out.println("balance ok for account " + i);
            }
        }
        try {
            output.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return keyList;

    }

    public static void createAccount() {

        apiMsg.set(api.getAccount().accountCreate(Collections.singletonList(pwd), false));
        if(!apiMsg.isError()) {
            keyList.add(((List<Key>) apiMsg.getObject()).get(0).getPubKey());

            try {
                output.write(((List<Key>) apiMsg.getObject()).get(0).getPubKey().toString());
                output.newLine();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static void transferAmount(Address from_acct, Address to_acct, String pwd_genesis) {

        if (api.getWallet().unlockAccount(from_acct, pwd_genesis).getObject().equals(true)) {
            TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                    .data(ByteArrayWrapper.wrap("TestSendTransaction!".getBytes()))
                    .from(from_acct)
                    .to(to_acct)
                    .nrgLimit(40000)
                    .nrgPrice(1)
                    .value(amountToTransfer)
                    .nonce(BigInteger.ZERO);

            api.getTx().fastTxbuild(builder.createTxArgs());

            Hash256 hash = ((MsgRsp) api.getTx().sendTransaction(null).getObject()).getTxHash();
            if (hash == null || hash.equals("00000000000000000000000000000000000000000000000000000000")) {
                System.out.println("no valid txhash received " + hash);
            } else {
                System.out.println("valid txnhash: " + hash);
            }

        } else {
            System.out.println("could not unlock account");
        }

    }
}
