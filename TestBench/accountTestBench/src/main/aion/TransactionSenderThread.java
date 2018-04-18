package main.aion;

import org.aion.api.IAionAPI;
import org.aion.api.IUtils;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.MsgRsp;
import org.aion.api.type.TxArgs;
import org.aion.base.type.Address;
import org.aion.base.util.ByteArrayWrapper;

import java.math.BigInteger;
import java.util.List;
import java.util.Random;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class TransactionSenderThread {
    static IAionAPI api;
    private static boolean isActive = true;

    public static void sendTransaction(IAionAPI api_in, List<Address> accountList, String password, Long tail_addr, int interval, int queueMax, String url)
            throws InterruptedException {
        api = api_in;
        long startTime = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
        AtomicInteger dropped = new AtomicInteger(0);
        BlockingQueue<byte[]> queue = new LinkedBlockingQueue<>();
        //String head_addr = "0xa00000000000000000000000000000000000000000000";
        //Address newAccount = Address.wrap(head_addr + tail_addr.toString());
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

        while (true) {
            try {
                while (queue.size() >= queueMax || !isActive) {
                    Thread.sleep(interval);
                }
                for (int i = 0; i < accountList.size(); i++) {
                    if (api.getWallet().unlockAccount(accountList.get(i), password, 10000).getObject().equals(true)) {
                        Address newAccount = Address.wrap(getRandomHexString());
                        System.out.println("[Log] transaction sent to " + newAccount.toString());
                        TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder()
                                .data(ByteArrayWrapper.wrap("TestCreateAccount!".getBytes()))
                                .from(accountList.get(i))
                                .to(newAccount)
                                .nrgLimit(23000)
                                .nrgPrice(1)
                                .value(BigInteger.ONE)
                                .nonce(BigInteger.ZERO);

                        api.getTx().fastTxbuild(builder.createTxArgs());
                        byte[] hash = ((MsgRsp) api.getTx().nonBlock().sendTransaction(null).getObject()).getMsgHash().getData();
                        queue.add(hash);
                        //tail_addr--;
                        //newAccount = Address.wrap(head_addr + String.valueOf(tail_addr));
//                        if (count.get() >= totalTxs) {
//                            t.interrupt();
//                            break;
//                        }
                    }
                    Thread.sleep(interval);
                }
            } catch (Exception e) {
                Thread.sleep(interval);
            }
        }
    }
    private static String getRandomHexString(){
        Random r = new Random();
        StringBuffer sb = new StringBuffer();
        while(sb.length() < 62){
            sb.append(Integer.toHexString(r.nextInt()));
        }

        return "0a" + sb.toString().substring(0, 62);
    }

    // return (int) (count.get() / ((System.currentTimeMillis() - startTime) / 1000));
    //}

    public static void tearDown() {
        api.destroyApi();
    }
}

