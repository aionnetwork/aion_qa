package main.aion.transfer;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.MsgRsp;
import org.aion.api.type.TxArgs;
import org.aion.base.type.Address;
import org.aion.base.util.ByteArrayWrapper;

import java.io.*;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingDeque;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.atomic.AtomicInteger;

public class TransactionSenderThreadTxt {
    private static List<Address> accountList = new ArrayList<>();
    private static IAionAPI api;
    private static Address accountFrom;

    private static long expectedBalance;
    private static BlockingDeque<byte[]> queue = new LinkedBlockingDeque<>();
    private static boolean isActive = true;
    private static String url = IAionAPI.LOCALHOST_URL;
    private static int interval = 0;
    private static long startTime = System.currentTimeMillis();
    private static AtomicInteger count = new AtomicInteger(0);
    private static AtomicInteger dropped = new AtomicInteger(0);
    private static int queueMax;
    public static void main(String[] args) {
        accountFrom = Address.wrap(args[0]);
        String password = args[1];

        expectedBalance = Long.parseLong(args[2]);
        interval = Integer.parseInt(args[3]);
        queueMax = Integer.parseInt(args[4]);
        api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(url);
        String fileName = "dummyAccounts.txt";
        try {

            if (api.getWallet().unlockAccount(accountFrom, password, 86400).getObject().equals(Boolean.valueOf(false))) {
                System.out.println("[ERROR] Unlock failed.");
                System.exit(0);
            } else {
                System.out.println("[Log] Account unlocked.");
            }

            File file = new File(fileName);
            if (file.exists() && file.isFile()) {
                readFile(fileName);
                System.out.println("[Log] File read complete.");
                try {
                    validateAccounts();
                    //System.out.println("[Log] Validating transfers ..");
                    //validateTransfers();
                    //System.out.println("[Log] Transfer validation complete.");
                    System.exit(0);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            } else {
                System.out.println("[ERROR] occurred in reading the file.");
                System.exit(0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void validateAccounts() throws InterruptedException {

        Thread t = new Thread(() -> {
            while (count.intValue() < accountList.size()) {
                try {
                    Thread.sleep(interval * 5);
                    int qSize = queue.size();
                    long duration = (System.currentTimeMillis() - startTime) / 1000;
                    if (duration != 0)
                        System.out.println("proccessed tx: " + count + ", queue size: " + qSize + ", dropped: " + dropped
                                + ", throughput (tx/sec): " + count.get() / duration);
                    for (int i = 0; i < qSize; i++) {
                        byte[] msgHash = queue.take();

                        ApiMsg apiMsg = api.getTx().getMsgStatus(ByteArrayWrapper.wrap(msgHash));
                        if (((MsgRsp) apiMsg.getObject()).getStatus() == 54) {
                            System.out.println("restarting api connection.");
                            isActive = false;
                            tearDown();
                            Thread.sleep(5000);
                            api = IAionAPI.init();
                            api.connect(url);
                            queue.clear();
                            isActive = true;
                            break;
                        } else if (((MsgRsp) apiMsg.getObject()).getStatus() == 105) {
                            count.incrementAndGet();
                        } else if (((MsgRsp) apiMsg.getObject()).getStatus() == 102 || ((MsgRsp) apiMsg.getObject()).getStatus() <= 2) {
                            dropped.incrementAndGet();
                        }
                        else{
                            queue.put(msgHash);
                        }
                    }
                } catch (InterruptedException e) {
                    break;
                }
            }
        });

        t.start();

        for (int i = 0; i < accountList.size(); i++) {
            while (queue.size() >= queueMax || !isActive) {
                Thread.sleep(interval);
            }
            BigInteger bal = api.getChain().getBalance(accountList.get(i)).getObject();
            if (bal.compareTo(BigInteger.valueOf(expectedBalance)) < 0) {
            BigInteger diff = BigInteger.valueOf(expectedBalance);
            Address accountTo = accountList.get(i);
            TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                    .data(ByteArrayWrapper.wrap("TestSendTransaction!".getBytes()))
                    .from(accountFrom)
                    .to(accountTo)
                    .nrgLimit(23000)
                    .nrgPrice(1)
                    .value(diff)
                    .nonce(BigInteger.ZERO);

            api.getTx().fastTxbuild(builder.createTxArgs());

            byte[] hash = ((MsgRsp) api.getTx().nonBlock().sendTransaction(null).getObject()).getMsgHash().getData();
            queue.add(hash);

            Thread.sleep(interval);
        }
         }
    }


    private static void readFile(String fileName) {

        try {
            String line;
            FileReader fileReader = new FileReader(fileName);
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            while ((line = bufferedReader.readLine()) != null) {
                accountList.add(Address.wrap(line));
            }
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            System.out.println("[ERROR] Unable to open file '" + fileName + "'");
        } catch (IOException ex) {
            System.out.println("[ERROR] Error reading file '" + fileName + "'");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static void tearDown() {
        api.destroyApi();
    }
}
