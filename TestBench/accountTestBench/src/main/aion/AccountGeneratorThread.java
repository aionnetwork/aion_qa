package main.aion;

import org.aion.api.IAionAPI;
import org.aion.api.type.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

import org.aion.base.type.Address;
import org.aion.base.type.Hash256;
import org.aion.base.util.ByteArrayWrapper;

public class AccountGeneratorThread {

    private static ApiMsg apiMsg;
    private static IAionAPI api;
    private static String pwd;
    private static BufferedWriter output;
    private static BlockingQueue<Address> accountQueue;
    private static int iteration = 0;
    private static BigInteger amountToTransfer = BigInteger.valueOf(1000000L);
    private static List<Address> accountList;

    public static List<Address> run(IAionAPI api_in, ApiMsg apiMsg_in, Address accountFrom, int accountCount, File accountFile, String password, int interval)
            throws InterruptedException {

        accountQueue = new LinkedBlockingDeque<>();
        accountList = new ArrayList<>();
        pwd = password;
        apiMsg = apiMsg_in;
        api = api_in;
        try {
            FileWriter f = new FileWriter(accountFile, true);
            output = new BufferedWriter(f);

        } catch (Exception e) {
            System.out.println("fileWriter through an exception!");
            e.printStackTrace();
        }
        if (api.getWallet().unlockAccount(accountFrom, pwd, 86400).getObject().equals(false)) {
            System.out.println("[ERROR] unlock failed.");
            System.exit(0);
        }
        BigInteger bal = api.getChain().getBalance(accountFrom).getObject();
        if (bal.compareTo(BigInteger.ZERO) == 0) {
            System.out.println("[Error] insufficient balance.");
            System.exit(0);
        }

        Thread unlockThread = new Thread(() -> {
            while (true) {
                try {
                    if (api.getWallet().unlockAccount(accountFrom, pwd, 86400).getObject().equals(Boolean.valueOf(false))) {
                        System.out.println("Unlock failed.");
                        System.exit(0);
                    } else {
                        System.out.println("Account unlocked.");
                    }
                    Thread.sleep(86400);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });

        Thread transferThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(interval);
                    int i = 0;
                    while (i < accountQueue.size()) {
                        Address receiverAddress = accountQueue.take();
                        transferAmount(accountFrom, receiverAddress);
                        accountList.add(receiverAddress);
                    }
                } catch (InterruptedException e) {
                    break;
                }
            }
        });

        // unlockThread.start();
        transferThread.start();

        while (iteration < accountCount) {
            try {
                createAccount();
                iteration++;
            } catch (Exception e) {
                e.printStackTrace();
                break;
            }
        }

        try {
            output.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        while (accountQueue.size() != 0) {
            Thread.sleep(500);
        }
        transferThread.interrupt();
        return accountList;

    }

    public static void createAccount() throws Exception {

        apiMsg.set(api.getAccount().accountCreate(Collections.singletonList(pwd), false));
        if (!apiMsg.isError()) {
            System.out.println("account " + iteration + ": " + ((List<Key>) apiMsg.getObject()).get(0).getPubKey().toString());
            accountQueue.put(((List<Key>) apiMsg.getObject()).get(0).getPubKey());
            output.write(((List<Key>) apiMsg.getObject()).get(0).getPubKey().toString());
            output.newLine();
            output.flush();
        }
    }

    public static void transferAmount(Address from_acct, Address to_acct) {

        TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                .data(ByteArrayWrapper.wrap("TestSendTransaction!".getBytes()))
                .from(from_acct)
                .to(to_acct)
                .nrgLimit(23000)
                .nrgPrice(1)
                .value(amountToTransfer)
                .nonce(BigInteger.ZERO);

        api.getTx().fastTxbuild(builder.createTxArgs());

        Hash256 hash = ((MsgRsp) api.getTx().nonBlock().sendTransaction(null).getObject()).getTxHash();
        if (hash == null || hash.toString().equals("0000000000000000000000000000000000000000000000000000000000000000")) {
            System.out.println("[Error] no valid txn hash for " + to_acct.toString());
        } else {
            System.out.println("[Log] transfer value txn hash for " + to_acct.toString() + " : " + hash);
        }

    }
}
