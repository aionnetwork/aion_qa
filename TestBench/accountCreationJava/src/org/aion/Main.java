package org.aion;

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

    private static IAionAPI api = null;
    private static Address cb, cb2;
    private static Long tail_addr;
    private static String head_addr = "0x000000000000000000000000000000000000000000000";
    private static Integer queueMax;

    public static void main(String[] args) throws InterruptedException {

        cb = Address.wrap(args[0]);
        String defaultPassword = args[1];
        tail_addr = args[2].equals("0") ? Long.MAX_VALUE : Long.valueOf(args[2]);
        cb2 = Address.wrap(head_addr + tail_addr.toString());
        int totalTxs = Integer.parseInt(args[3]);
        int interval = Integer.parseInt(args[4]);
        queueMax = Integer.parseInt(args[5]);
        String url = "tcp://127.0.0.1:8547";

        api = IAionAPI.init();
        api.connect(url);

        if (api.getWallet().unlockAccount(cb, defaultPassword, 86400).getObject().equals(Boolean.valueOf(false))) {
            System.out.println("Unlock failed.");
            System.exit(0);
        }

        int throughput = run(totalTxs, interval);
        tearDown();

        System.out.println("Average throughput (tx/sec): " + throughput);
    }

    private static int run(int totalTxs, int interval) throws InterruptedException {
        long startTime = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
        BlockingDeque<byte[]> queue = new LinkedBlockingDeque<>();

        Thread t = new Thread(() -> {
            while (true) {
                try {

                    Thread.sleep(interval * 5);
                    int qSize = queue.size();
                    long duration = (System.currentTimeMillis() - startTime) / 1000;
                    if (duration != 0)
                        System.out.println("proccessed tx: " + count + ", queue size: " + qSize
                                + ", throughput (tx/sec): " + count.get() / duration);
                    for (int i = 0; i < qSize; i++) {
                        byte[] msgHash = queue.take();

                        ApiMsg apiMsg = api.getTx().getMsgStatus(ByteArrayWrapper.wrap(msgHash));
                        if (IUtils.endTxStatus(((MsgRsp) apiMsg.getObject()).getStatus())) {
                            count.incrementAndGet();
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

        while (true) {
            try {
                while (queue.size() > queueMax) {
                    Thread.sleep(interval);
                }
                TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                        .data(ByteArrayWrapper.wrap("TestCreateAccount!".getBytes()))
                        .from(cb)
                        .to(cb2)
                        .nrgLimit(23000)
                        .nrgPrice(1)
                        .value(BigInteger.ONE)
                        .nonce(BigInteger.ZERO);

                api.getTx().fastTxbuild(builder.createTxArgs());
                byte[] hash = ((MsgRsp) api.getTx().nonBlock().sendTransaction(null).getObject()).getMsgHash().getData();

                queue.add(hash);
                tail_addr--;
                cb2 = Address.wrap(head_addr + String.valueOf(tail_addr));
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


