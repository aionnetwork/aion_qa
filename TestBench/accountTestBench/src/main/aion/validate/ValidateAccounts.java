package main.aion.validate;

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

public class ValidateAccounts {
    private static List<Address> accountList = new ArrayList<>();
    private static IAionAPI api;
    private static Address accountFrom;
    private static long expectedBalance;
    private static BlockingDeque<byte[]> queue = new LinkedBlockingDeque<>();
    private static boolean isActive = true;
    private static String url = IAionAPI.LOCALHOST_URL;
    private static int count = 0;
    private static int interval = 0;

    public static void main(String[] args) {

        accountFrom = Address.wrap(args[0]);
        String password = args[1];

        expectedBalance =  Long.parseLong(args[2]);
        interval = Integer.parseInt(args[3]);

        api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(url);
        String fileName = "accounts.txt";
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
                    System.out.println("[Log] Account count " + accountList.size() + " - " + count + " transfers made.");
                    System.out.println("[Log] Validating transfers ..");
                    validateTransfers();
                    System.out.println("[Log] Transfer validation complete.");
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

    private static void validateTransfers() throws InterruptedException {
        while (queue.size() != 0) {
            byte[] msgHash = queue.take();
            ApiMsg apiMsg = api.getTx().getMsgStatus(ByteArrayWrapper.wrap(msgHash));
            if (((MsgRsp) apiMsg.getObject()).getStatus() == 54) {
                System.out.println("restarting.");
                isActive = false;
                api.destroyApi();
                Thread.sleep(5000);
                api = IAionAPI.init();
                api.connect(url);
                queue.clear();
                isActive = true;
                break;
            } else if (((MsgRsp) apiMsg.getObject()).getStatus() == 105) {
                count--;
                System.out.println("[Log]" + count + " remaining.");
            } else {
                queue.put(msgHash);
            }
        }
    }

    private static void validateAccounts() throws InterruptedException {
        for (int i = 0; i < accountList.size(); i++) {
            BigInteger bal = api.getChain().getBalance(accountList.get(i)).getObject();
            if (bal.compareTo(BigInteger.valueOf(expectedBalance)) < 0) {
                BigInteger diff = BigInteger.valueOf(expectedBalance).subtract(bal);
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
                count++;
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
}