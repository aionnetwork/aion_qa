package main.org.aion;

import org.aion.api.IAionAPI;
import org.aion.api.IUtils;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.MsgRsp;
import org.aion.api.type.TxArgs;
import org.aion.base.type.Address;
import org.aion.base.util.ByteArrayWrapper;

import java.math.BigInteger;
import java.util.concurrent.BlockingDeque;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {

    /**
     * parameters
     * [0] account for sending transactions
     * [1] password of sender
     * [2] receiver account
     * [3] total number of txns to send before stopping
     * [4] sleep time between transactions in ms
     * [5] max queue size
     * [6] url to connect to
     */


    private static IAionAPI api = null;
    private static Address cb, cb2;
    private static String url = "tcp://127.0.0.1:8547";
    private static int totalTxs;
    private static int interval;
    private static int queueMax;
    private static boolean isActive;
    private static String pw;


    public static void main(String[] args) throws InterruptedException {

        cb = Address.wrap(args[0]);
        pw = args[1];
        cb2 = Address.wrap(args[2]);
        totalTxs = Integer.parseInt(args[3]);
        interval = Integer.parseInt(args[4]);
        queueMax = Integer.parseInt(args[5]);
        if (args.length == 7)
            url = args[6];

        isActive = true;
        api = IAionAPI.init();
        api.connect(url);

        if (api.getWallet().unlockAccount(cb, pw, 86400).getObject().equals(Boolean.valueOf(false))) {
            System.out.println("Unlock failed.");
            System.exit(0);
        }

        int throughput = run();
        tearDown();
        System.out.println("Average throughput (tx/sec): " + throughput);
    }

    private static int run() throws InterruptedException {
        long startTime = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
        AtomicInteger dropped = new AtomicInteger(0);
        BlockingDeque<byte[]> queue = new LinkedBlockingDeque<>();

        Thread t2 = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(86400000);
                    if (api.getWallet().unlockAccount(cb, pw, 86400).getObject().equals(Boolean.valueOf(false))) {
                        System.out.println("Unlock failed.");
                        System.exit(0);
                    } else {
                        System.out.println("Unlocked.");
                    }

                } catch (InterruptedException e) {
                    break;
                }
            }

        });

        Thread t = new Thread(() -> {
            while (true) {
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
                            System.out.println("restarting.");
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
                        } else {
                            queue.put(msgHash);
                        }
                    }

                } catch (InterruptedException e) {
                    break;
                }
            }
        });

        t.start();
        t2.start();

        while (true) {
            try {
                while (queue.size() >= queueMax || !isActive) {
                    Thread.sleep(interval);
                }

                TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                        .data(ByteArrayWrapper.wrap("Test".getBytes()))
                        .from(cb)
                        .to(cb2)
                        .nrgLimit(23000)
                        .nrgPrice(1)
                        .value(BigInteger.ONE)
                        .nonce(BigInteger.ZERO);

                api.getTx().fastTxbuild(builder.createTxArgs());
                byte[] hash = ((MsgRsp) api.getTx().nonBlock().sendTransaction(null).getObject()).getMsgHash().getData();

                queue.add(hash);
                if (count.get() >= totalTxs) {
                    t.interrupt();
                    break;
                }
            } catch (Exception e) {
                Thread.sleep(interval);
            }
            Thread.sleep(interval);
        }
        return (int) (count.get() / ((System.currentTimeMillis() - startTime) / 1000));
    }

    public static void tearDown() {
        api.destroyApi();
    }


}


